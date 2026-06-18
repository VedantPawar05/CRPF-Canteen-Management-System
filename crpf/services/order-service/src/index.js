const express = require('express');
const http = require('http');
const { Pool } = require('pg');
const amqplib = require('amqplib');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 4003;

const QR_SECRET = process.env.QR_SECRET || 'crpf-qr-signing-key';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpassword',
  database: process.env.DB_NAME || 'servesmart',
});

let rabbitChannel = null;

async function connectRabbitMQ() {
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
    rabbitChannel = await conn.createChannel();
    await rabbitChannel.assertExchange('order_events', 'fanout', { durable: true });
    console.log('📡 Connected to RabbitMQ');
  } catch (err) {
    console.warn('⚠️ RabbitMQ not available, running without event publishing:', err.message);
  }
}

function publishEvent(eventType, data) {
  if (!rabbitChannel) return;
  const message = JSON.stringify({ type: eventType, data, timestamp: new Date().toISOString() });
  rabbitChannel.publish('order_events', '', Buffer.from(message));
}

function generateQRData(orderId, amount) {
  const timestamp = Date.now();
  const hash = crypto.createHmac('sha256', QR_SECRET)
    .update(`${orderId}|${amount}|${timestamp}`)
    .digest('hex')
    .substring(0, 16);
  const upiString = `upi://pay?pa=crpfcanteen@okhdfcbank&pn=CRPF%20Canteen&am=${amount.toFixed(2)}&cu=INR&tn=Order%20${orderId}&tr=${orderId}&mc=5812`;
  return { orderId, amount, timestamp, hash, upiString, expiresAt: timestamp + 5 * 60 * 1000 };
}

// ── WebSocket ────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('join_kitchen', () => socket.join('kitchen'));
  socket.on('join_user', (userId) => socket.join(`user_${userId}`));
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// ── Create Order ─────────────────────────────────────────────────
app.post('/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const { items } = req.body;
    const userId = req.headers['x-user-id'];

    await client.query('BEGIN');

    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const menuResult = await client.query('SELECT id, price, name FROM menu_items WHERE id = $1 AND is_available = true', [item.menuItemId || item.id]);
      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Menu item ${item.menuItemId || item.id} not found or unavailable` });
      }
      const menuItem = menuResult.rows[0];
      totalAmount += menuItem.price * item.quantity;
      orderItems.push({ ...menuItem, quantity: item.quantity, priceAtTime: menuItem.price });
    }

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, totalAmount, 'Pending']
    );
    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
        [order.id, item.id, item.quantity, item.priceAtTime]
      );
    }

    await client.query('COMMIT');

    const fullOrder = { ...order, items: orderItems };
    publishEvent('ORDER_CREATED', fullOrder);
    io.to('kitchen').emit('new_order', fullOrder);

    res.status(201).json(fullOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create Order Error:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// ── Update Order Status (PATCH + PUT) ────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = result.rows[0];
    publishEvent('ORDER_STATUS_UPDATED', order);
    io.to('kitchen').emit('order_updated', order);
    io.to(`user_${order.user_id}`).emit('order_updated', order);

    res.json(order);
  } catch (err) {
    console.error('Update Status Error:', err.message);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
app.patch('/orders/:id/status', updateOrderStatus);
app.put('/orders/:id/status', updateOrderStatus);

// ── Get Orders (with filters) ────────────────────────────────────
app.get('/orders', async (req, res) => {
  try {
    const { status, userId } = req.query;
    let query = `
      SELECT 
        o.id,
        u.username as "soldierName",
        u.username as pno,
        o.total_amount::float as total,
        o.status,
        'Wallet' as payment,
        to_char(o.created_at, 'Mon DD, YYYY') as date,
        to_char(o.created_at, 'HH12:MI AM') as time,
        COALESCE(
          (SELECT string_agg(mi.name || ' x' || oi.quantity, ', ')
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = o.id
          ), 'N/A'
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (status) { conditions.push(`o.status = $${params.length + 1}`); params.push(status); }
    if (userId) { conditions.push(`o.user_id = $${params.length + 1}`); params.push(userId); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get Orders Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ── Get Kitchen Live Orders ──────────────────────────────────────
app.get('/orders/kitchen/live', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id, o.status, o.total_amount, o.created_at,
        u.username as "soldierName",
        COALESCE(
          (SELECT string_agg(mi.name || ' x' || oi.quantity, ', ')
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = o.id
          ), 'N/A'
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.status IN ('Pending', 'Accepted', 'Preparing')
      ORDER BY o.created_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Kitchen Live Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch kitchen orders' });
  }
});

// ── QR Code for Order ────────────────────────────────────────────
app.get('/orders/:id/qr', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = result.rows[0];
    const qrData = generateQRData(order.id, parseFloat(order.total_amount));
    res.json(qrData);
  } catch (err) {
    console.error('QR Error:', err.message);
    res.status(500).json({ error: 'Failed to generate QR' });
  }
});

// ── Get Admin Stats ────────────────────────────────────────────────
app.get('/orders/stats', async (req, res) => {
  try {
    const todayResult = await pool.query(`
      SELECT SUM(total_amount) as revenue 
      FROM orders 
      WHERE created_at >= CURRENT_DATE 
      AND status NOT IN ('Cancelled')
    `);
    const activeResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE status IN ('Pending', 'Accepted', 'Preparing', 'Ready')
    `);
    const trendResult = await pool.query(`
      SELECT 
        to_char(created_at, 'Mon DD') as date,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
      AND status NOT IN ('Cancelled')
      GROUP BY to_char(created_at, 'Mon DD'), created_at::DATE
      ORDER BY created_at::DATE ASC
    `);
    const popularResult = await pool.query(`
      SELECT mi.name, SUM(oi.quantity) as count
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days' AND o.status NOT IN ('Cancelled')
      GROUP BY mi.id, mi.name
      ORDER BY count DESC
      LIMIT 3
    `);

    res.json({
      todayRevenue: parseFloat(todayResult.rows[0].revenue) || 0,
      activeOrders: parseInt(activeResult.rows[0].count, 10) || 0,
      trend: trendResult.rows.map(r => ({
        date: r.date,
        revenue: parseFloat(r.revenue) || 0
      })),
      popularItems: popularResult.rows.map(r => ({ name: r.name, count: parseInt(r.count, 10) }))
    });
  } catch (err) {
    console.error('Stats Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/orders/health', (req, res) => res.json({ status: 'ok', service: 'order-service' }));

connectRabbitMQ().then(() => {
  server.listen(PORT, () => console.log(`🛒 Order Service running on port ${PORT}`));
});
