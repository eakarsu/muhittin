const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, published, search } = req.query;
    let query = 'SELECT w.*, b.name as business_name FROM websites w LEFT JOIN businesses b ON w.business_id = b.id WHERE 1=1';
    const params = [];
    if (business_id) { params.push(business_id); query += ` AND w.business_id = $${params.length}`; }
    if (published !== undefined) { params.push(published === 'true'); query += ` AND w.published = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (w.page_title ILIKE $${params.length} OR w.headline ILIKE $${params.length})`; }
    query += ' ORDER BY w.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM websites');
    const published = await pool.query('SELECT COUNT(*) FROM websites WHERE published = true');
    const totalVisits = await pool.query('SELECT SUM(visits) as total FROM websites');
    res.json({
      total: parseInt(total.rows[0].count),
      published: parseInt(published.rows[0].count),
      totalVisits: parseInt(totalVisits.rows[0].total || 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT w.*, b.name as business_name FROM websites w LEFT JOIN businesses b ON w.business_id = b.id WHERE w.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Website not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, page_title, slug, template, headline, subheadline, cta_text, cta_link, sections } = req.body;
    const result = await pool.query(
      `INSERT INTO websites (business_id, page_title, slug, template, headline, subheadline, cta_text, cta_link, sections)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [business_id, page_title, slug, template, headline, subheadline, cta_text, cta_link, sections]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { business_id, page_title, slug, template, headline, subheadline, cta_text, cta_link, sections, published } = req.body;
    const result = await pool.query(
      `UPDATE websites SET business_id=$1, page_title=$2, slug=$3, template=$4, headline=$5, subheadline=$6, cta_text=$7, cta_link=$8, sections=$9, published=$10
       WHERE id=$11 RETURNING *`,
      [business_id, page_title, slug, template, headline, subheadline, cta_text, cta_link, sections, published, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Website not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle publish
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE websites SET published = NOT published WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Website not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM websites WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Website not found' });
    res.json({ message: 'Website deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
