const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, status, rating, source, search } = req.query;
    let query = 'SELECT r.*, b.name as business_name FROM reviews r LEFT JOIN businesses b ON r.business_id = b.id WHERE 1=1';
    const params = [];
    if (business_id) { params.push(business_id); query += ` AND r.business_id = $${params.length}`; }
    if (status) { params.push(status); query += ` AND r.status = $${params.length}`; }
    if (rating) { params.push(rating); query += ` AND r.rating = $${params.length}`; }
    if (source) { params.push(source); query += ` AND r.source = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (r.customer_name ILIKE $${params.length} OR r.comment ILIKE $${params.length})`; }
    query += ' ORDER BY r.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM reviews');
    const avgRating = await pool.query('SELECT AVG(rating) as avg FROM reviews');
    const pending = await pool.query("SELECT COUNT(*) FROM reviews WHERE status = 'pending'");
    const byRating = await pool.query('SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating DESC');
    const bySource = await pool.query('SELECT source, COUNT(*) as count FROM reviews GROUP BY source ORDER BY count DESC');
    res.json({
      total: parseInt(total.rows[0].count),
      avgRating: parseFloat(avgRating.rows[0].avg || 0).toFixed(1),
      pending: parseInt(pending.rows[0].count),
      byRating: byRating.rows,
      bySource: bySource.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT r.*, b.name as business_name FROM reviews r LEFT JOIN businesses b ON r.business_id = b.id WHERE r.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, customer_name, rating, comment, source } = req.body;
    const result = await pool.query(
      `INSERT INTO reviews (business_id, customer_name, rating, comment, source) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [business_id, customer_name, rating, comment, source || 'manual']
    );
    await createNotification(req.user.id, 'review', `New ${rating}-Star Review`, `${customer_name} left a review`, '/reviews');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { business_id, customer_name, rating, comment, source, status, response } = req.body;
    const responded_at = response ? 'NOW()' : 'NULL';
    const result = await pool.query(
      `UPDATE reviews SET business_id=$1, customer_name=$2, rating=$3, comment=$4, source=$5, status=$6, response=$7, responded_at=${response ? 'NOW()' : 'responded_at'}
       WHERE id=$8 RETURNING *`,
      [business_id, customer_name, rating, comment, source, status, response, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Respond to review
router.patch('/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { response } = req.body;
    const result = await pool.query(
      `UPDATE reviews SET response = $1, status = 'responded', responded_at = NOW() WHERE id = $2 RETURNING *`,
      [response, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
