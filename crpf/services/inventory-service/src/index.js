const express = require('express');
const { Pool } = require('pg');
const amqplib = require('amqplib');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4004;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'admin', password: process.env.DB_PASSWORD || 'adminpassword',
  database: process.env.DB_NAME || 'servesmart',
});

// ── RabbitMQ Consumer: Auto-deduct stock on ORDER_CREATED ────────
async function startConsumer() {
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
    const channel = await conn.createChannel();
    await channel.assertExchange('order_events', 'fanout', { durable: true });
    const q = await channel.assertQueue('inventory_queue', { durable: true });
    await channel.bindQueue(q.queue, 'order_events', '');

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        if (event.type === 'ORDER_CREATED') {
          for (const item of event.data.items) {
            await pool.query(
              'UPDATE inventory SET stock_quantity = GREATEST(stock_quantity - $1, 0), updated_at = NOW() WHERE menu_item_id = $2',
              [item.quantity, item.id]
            );
          }
          console.log(`📦 Stock deducted for order ${event.data.id}`);
        }
        channel.ack(msg);
      } catch (e) {
        console.error('Consumer error:', e.message);
        channel.nack(msg, false, true);
      }
    });
    console.log('📡 Inventory consumer listening');
  } catch (err) {
    console.warn('⚠️ RabbitMQ not available for inventory consumer:', err.message);
  }
}

// ── Get All Inventory ────────────────────────────────────────────
app.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        i.id, 
        mi.name, 
        c.name as category, 
        i.stock_quantity as "stockLevel", 
        i.max_stock_capacity as "maxStock", 
        mi.price::float as price, 
        mi.image_url as image,
        CASE 
          WHEN i.stock_quantity = 0 THEN 'Out of Stock'
          WHEN i.stock_quantity <= i.low_stock_threshold THEN 'Low Stock'
          ELSE 'In Stock'
        END as status
       FROM inventory i 
       JOIN menu_items mi ON i.menu_item_id = mi.id
       JOIN categories c ON mi.category_id = c.id
       ORDER BY i.stock_quantity ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// ── Get Low Stock Items ──────────────────────────────────────────
app.get('/inventory/low-stock', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT i.*, mi.name as item_name FROM inventory i JOIN menu_items mi ON i.menu_item_id = mi.id WHERE i.stock_quantity <= i.low_stock_threshold ORDER BY i.stock_quantity ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// ── Update Stock (Restock) ───────────────────────────────────────
app.patch('/inventory/:menuItemId/restock', async (req, res) => {
  try {
    const { quantity } = req.body;
    const result = await pool.query(
      'UPDATE inventory SET stock_quantity = stock_quantity + $1, updated_at = NOW() WHERE menu_item_id = $2 RETURNING *',
      [quantity, req.params.menuItemId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Inventory record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to restock' });
  }
});

app.get('/inventory/health', (req, res) => res.json({ status: 'ok', service: 'inventory-service' }));

startConsumer().then(() => {
  app.listen(PORT, () => console.log(`📦 Inventory Service running on port ${PORT}`));
});
