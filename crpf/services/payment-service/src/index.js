const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4005;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'admin', password: process.env.DB_PASSWORD || 'adminpassword',
  database: process.env.DB_NAME || 'servesmart',
});

const QR_SECRET = process.env.QR_SECRET || 'crpf-qr-signing-key';

// ── Generate QR Payment Data ─────────────────────────────────────
app.post('/payment/generate-qr', async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const timestamp = Date.now();

    const hash = crypto.createHmac('sha256', QR_SECRET)
      .update(`${orderId}|${amount}|${timestamp}`)
      .digest('hex')
      .substring(0, 16);

    const upiString = `upi://pay?pa=crpfcanteen@okhdfcbank&pn=CRPF%20Canteen&am=${amount.toFixed(2)}&cu=INR&tn=Order%20${orderId}&tr=${orderId}&mc=5812`;

    res.json({
      orderId,
      amount,
      timestamp,
      hash,
      upiString,
      expiresAt: timestamp + 5 * 60 * 1000,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR data' });
  }
});

// ── Verify Payment (Webhook/Simulation) ──────────────────────────
app.post('/payment/verify', async (req, res) => {
  const client = await pool.connect();
  try {
    const { orderId, amount, upiTransactionId } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      "INSERT INTO transactions (order_id, amount, status, upi_transaction_id) VALUES ($1, $2, 'Success', $3) RETURNING *",
      [orderId, amount, upiTransactionId || `SIM-${Date.now()}`]
    );

    await client.query("UPDATE orders SET status = 'Accepted', updated_at = NOW() WHERE id = $1", [orderId]);

    await client.query('COMMIT');
    res.json({ transaction: result.rows[0], message: 'Payment verified' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Payment verification failed' });
  } finally {
    client.release();
  }
});

// ── Get Wallet Balance (future) ──────────────────────────────────
app.get('/payment/wallet/:userId', async (req, res) => {
  res.json({ userId: req.params.userId, balance: 500.00, currency: 'INR' });
});

app.get('/payment/health', (req, res) => res.json({ status: 'ok', service: 'payment-service' }));

app.listen(PORT, () => console.log(`💳 Payment Service running on port ${PORT}`));
