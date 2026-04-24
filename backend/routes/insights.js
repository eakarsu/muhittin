const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Public: List published insights
router.get('/', async (req, res) => {
  try {
    const { category, domain, search } = req.query;
    let query = 'SELECT * FROM insights WHERE published = true';
    const params = [];
    if (category) { params.push(category); query += ` AND category = $${params.length}`; }
    if (domain) { params.push(domain); query += ` AND domain = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (title ILIKE $${params.length} OR summary ILIKE $${params.length})`; }
    query += ' ORDER BY published_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Get single published article by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM insights WHERE slug = $1 AND published = true', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Article not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create article
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, slug, category, domain, summary, content, author, published } = req.body;
    const published_at = published ? new Date() : null;
    const result = await pool.query(
      `INSERT INTO insights (title, slug, category, domain, summary, content, author, published, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, slug, category, domain, summary, content, author, published || false, published_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update article
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, slug, category, domain, summary, content, author, published } = req.body;

    // If published changed to true and published_at is null, set published_at
    let publishedAtClause = '';
    const extraParams = [];
    if (published) {
      publishedAtClause = ', published_at = COALESCE(published_at, NOW())';
    }

    const result = await pool.query(
      `UPDATE insights SET title=$1, slug=$2, category=$3, domain=$4, summary=$5, content=$6, author=$7, published=$8${publishedAtClause}
       WHERE id=$9 RETURNING *`,
      [title, slug, category, domain, summary, content, author, published, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Article not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete article
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM insights WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
