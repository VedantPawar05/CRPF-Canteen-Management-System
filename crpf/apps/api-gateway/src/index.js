const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'crpf-canteen-secret-key-change-in-production';

// ── Security Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(morgan('combined'));

// ── Rate Limiting ────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── JWT Authentication Middleware ────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ── Role-Based Access Control ────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// ── Health Check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// ── Service Discovery (URLs) ─────────────────────────────────────
const SERVICES = {
  auth:         process.env.AUTH_SERVICE_URL         || 'http://localhost:4001',
  menu:         process.env.MENU_SERVICE_URL         || 'http://localhost:4002',
  order:        process.env.ORDER_SERVICE_URL        || 'http://localhost:4003',
  inventory:    process.env.INVENTORY_SERVICE_URL    || 'http://localhost:4004',
  payment:      process.env.PAYMENT_SERVICE_URL      || 'http://localhost:4005',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4006',
};

// ── Public Routes (No Auth) ──────────────────────────────────────
app.use('/api/v1/auth', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/auth': '/auth' },
}));

app.use('/api/v1/menu', createProxyMiddleware({
  target: SERVICES.menu,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/menu': '/menu' },
}));

// ── Protected Routes (Require Auth) ──────────────────────────────
app.use('/api/v1/orders', authenticateToken, createProxyMiddleware({
  target: SERVICES.order,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/orders': '/orders' },
  onProxyReq: (proxyReq, req) => {
    if (req.user && req.user.id) {
      proxyReq.setHeader('x-user-id', req.user.id);
    }
  },
}));

app.use('/api/v1/inventory', authenticateToken, requireRole('admin', 'kitchen'), createProxyMiddleware({
  target: SERVICES.inventory,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/inventory': '/inventory' },
}));

app.use('/api/v1/payment', authenticateToken, createProxyMiddleware({
  target: SERVICES.payment,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/payment': '/payment' },
}));

app.use('/api/v1/notifications', authenticateToken, createProxyMiddleware({
  target: SERVICES.notification,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/notifications': '/notifications' },
}));

// ── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err.message);
  res.status(500).json({ error: 'Internal gateway error' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📡 Services:`, SERVICES);
});
