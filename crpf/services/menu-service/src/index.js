const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4002;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'admin', password: process.env.DB_PASSWORD || 'adminpassword',
  database: process.env.DB_NAME || 'servesmart',
});

let redis = null;
try {
  redis = new Redis({ host: process.env.REDIS_HOST || 'localhost', port: 6379 });
  redis.on('error', () => { redis = null; });
} catch { redis = null; }

const CACHE_TTL = 300; // 5 min

// ── Get All Menu Items (with Redis caching) ──────────────────────
app.get('/menu', async (req, res) => {
  try {
    if (redis) {
      const cached = await redis.get('menu:all');
      if (cached) return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT mi.id, mi.name, mi.description, mi.price::float as price, c.name as category, mi.image_url as image, mi.is_veg as "isVeg", mi.rating::float as rating, mi.prep_time as "prepTime", mi.is_available as "isAvailable" FROM menu_items mi LEFT JOIN categories c ON mi.category_id = c.id ORDER BY c.name, mi.name'
    );

    if (redis) await redis.setex('menu:all', CACHE_TTL, JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (err) {
    console.error('Get Menu Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// ── Get Menu by Category ─────────────────────────────────────────
app.get('/menu/category/:categoryId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT mi.id, mi.name, mi.description, mi.price::float as price, c.name as category, mi.image_url as image, mi.is_veg as "isVeg", mi.rating::float as rating, mi.prep_time as "prepTime", mi.is_available as "isAvailable" FROM menu_items mi LEFT JOIN categories c ON mi.category_id = c.id WHERE mi.category_id = $1 ORDER BY mi.name',
      [req.params.categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category items' });
  }
});

// ── Get Categories ───────────────────────────────────────────────
app.get('/menu/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ── Create Menu Item (Admin) ─────────────────────────────────────
app.post('/menu', async (req, res) => {
  try {
    const { name, description, price, category_id, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, category_id, image_url]
    );
    if (redis) await redis.del('menu:all');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// ── Update Menu Item (Admin) ─────────────────────────────────────
app.put('/menu/:id', async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_available } = req.body;
    const result = await pool.query(
      'UPDATE menu_items SET name=$1, description=$2, price=$3, category_id=$4, image_url=$5, is_available=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [name, description, price, category_id, image_url, is_available, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    if (redis) await redis.del('menu:all');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// ── Delete Menu Item (Admin) ─────────────────────────────────────
app.delete('/menu/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    if (redis) await redis.del('menu:all');
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

app.get('/menu/health', (req, res) => res.json({ status: 'ok', service: 'menu-service' }));

app.listen(PORT, () => console.log(`🍽️  Menu Service running on port ${PORT}`));
