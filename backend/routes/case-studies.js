const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/auth');

// Public: List published case studies (or all if authenticated with all=true)
router.get('/', optionalAuthenticateToken, async (req, res) => {
  try {
    const { industry, search, all } = req.query;
    const conditions = [];
    const params = [];

    const showAll = all === 'true' && req.user && ['owner', 'admin', 'manager', 'staff'].includes(req.user.role);

    if (!showAll) {
      conditions.push('published = true');
    }
    if (industry) { params.push(industry); conditions.push(`industry = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(title ILIKE $${params.length} OR challenge ILIKE $${params.length})`); }

    let query = 'SELECT * FROM case_studies';
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Get single published case study by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM case_studies WHERE slug = $1 AND published = true', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case study not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create case study
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, slug, industry, challenge, approach, result: resultText, impact, metrics, published } = req.body;
    const dbResult = await pool.query(
      `INSERT INTO case_studies (title, slug, industry, challenge, approach, result, impact, metrics, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, slug, industry, challenge, approach, resultText, impact, metrics ? JSON.stringify(metrics) : null, published || false]
    );
    res.status(201).json(dbResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update case study
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, slug, industry, challenge, approach, result: resultText, impact, metrics, published } = req.body;
    const dbResult = await pool.query(
      `UPDATE case_studies SET title=$1, slug=$2, industry=$3, challenge=$4, approach=$5, result=$6, impact=$7, metrics=$8, published=$9
       WHERE id=$10 RETURNING *`,
      [title, slug, industry, challenge, approach, resultText, impact, metrics ? JSON.stringify(metrics) : null, published, req.params.id]
    );
    if (dbResult.rows.length === 0) return res.status(404).json({ error: 'Case study not found' });
    res.json(dbResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete case study
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM case_studies WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case study not found' });
    res.json({ message: 'Case study deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
