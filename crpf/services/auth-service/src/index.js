const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'crpf-canteen-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'crpf-canteen-refresh-secret-change-in-production';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpassword',
  database: process.env.DB_NAME || 'servesmart',
});

// ── Signup ───────────────────────────────────────────────────────
app.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password, role = 'soldier' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, password_hash, role]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Login ────────────────────────────────────────────────────────
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ accessToken, refreshToken, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Refresh Token ────────────────────────────────────────────────
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const result = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// ── Admin OTP Registration Flow ─────────────────────────────────────
const mockOtpStore = new Map();

app.post('/auth/admin/send-otp', (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mockOtpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 mins

    // In a real industry setting, this calls Twilio SDK: client.messages.create(...)
    console.log(`\n================================`);
    console.log(`📱 MOCK SMS TO ${phone}`);
    console.log(`🔑 Your CRPF Canteen Admin Registration OTP is: ${otp}`);
    console.log(`================================\n`);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/auth/admin/verify-signup', async (req, res) => {
  try {
    const { phone, otp, username, password } = req.body;
    
    if (!phone || !otp || !username || !password) {
       return res.status(400).json({ error: 'All fields required' });
    }

    const record = mockOtpStore.get(phone);
    if (!record || record.otp !== otp || Date.now() > record.expires) {
       return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    mockOtpStore.delete(phone); // Burn OTP

    // Verify username doesn't exist
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username already in use' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, password_hash, 'admin']
    );

    const user = result.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) {
    console.error('Verify Signup Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Get Personnel ──────────────────────────────────────────────────
app.get('/auth/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username as pno, username as name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get Users Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Delete Personnel ────────────────────────────────────────────────
app.delete('/auth/users/:id', async (req, res) => {
  try {
    // In an enterprise app, we'd verify the requesting token is an admin
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User successfully deleted' });
  } catch (err) {
    console.error('Delete User Error:', err.message);
    res.status(500).json({ error: 'Internal server error while executing deletion cascade' });
  }
});

app.get('/auth/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.listen(PORT, () => console.log(`🔐 Auth Service running on port ${PORT}`));
