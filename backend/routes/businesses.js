const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

// Get all businesses (optionally filter by category)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = 'SELECT * FROM businesses WHERE 1=1';
    const params = [];
    if (category) { params.push(category); query += ` AND category = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get business stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM businesses');
    const active = await pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'active'");
    const categories = await pool.query('SELECT category, COUNT(*) as count FROM businesses GROUP BY category ORDER BY count DESC');
    const avgRating = await pool.query('SELECT AVG(rating) as avg_rating FROM businesses WHERE rating > 0');
    res.json({
      total: parseInt(total.rows[0].count),
      active: parseInt(active.rows[0].count),
      categories: categories.rows,
      avgRating: parseFloat(avgRating.rows[0].avg_rating || 0).toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single business
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM businesses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Business not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create business
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, logo_url } = req.body;
    const result = await pool.query(
      `INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, logo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [req.user.id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, logo_url]
    );
    await createNotification(req.user.id, 'business', 'Business Created', `${name} has been added to your portfolio`, '/businesses');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update business
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, logo_url, status } = req.body;
    const result = await pool.query(
      `UPDATE businesses SET name=$1, category=$2, subcategory=$3, description=$4, phone=$5, email=$6, website_url=$7, address=$8, city=$9, state=$10, zip_code=$11, hours=$12, services=$13, pricing_info=$14, logo_url=$15, status=$16
       WHERE id=$17 RETURNING *`,
      [name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, logo_url, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Business not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete business
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM businesses WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Business not found' });
    res.json({ message: 'Business deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
