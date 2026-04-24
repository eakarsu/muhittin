const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Public: List industries (published=true by default, all=true for admin)
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    let query = 'SELECT * FROM industries';
    if (all !== 'true') {
      query += ' WHERE published = true';
    }
    query += ' ORDER BY name ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Get single industry by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM industries WHERE slug = $1 AND published = true', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Industry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create industry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, slug, description, challenges, approach, solutions, related_services, published } = req.body;
    const result = await pool.query(
      `INSERT INTO industries (name, slug, description, challenges, approach, solutions, related_services, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, slug, description, challenges, approach, solutions, related_services ? JSON.stringify(related_services) : null, published !== undefined ? published : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update industry
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, slug, description, challenges, approach, solutions, related_services, published } = req.body;
    const result = await pool.query(
      `UPDATE industries SET name=$1, slug=$2, description=$3, challenges=$4, approach=$5, solutions=$6, related_services=$7, published=$8
       WHERE id=$9 RETURNING *`,
      [name, slug, description, challenges, approach, solutions, related_services ? JSON.stringify(related_services) : null, published, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Industry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete industry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM industries WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Industry not found' });
    res.json({ message: 'Industry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
