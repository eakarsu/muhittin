const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

// List contacts with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { company, industry, region, lifecycle_stage, source, search } = req.query;
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];
    if (company) { params.push(company); query += ` AND company = $${params.length}`; }
    if (industry) { params.push(industry); query += ` AND industry = $${params.length}`; }
    if (region) { params.push(region); query += ` AND region = $${params.length}`; }
    if (lifecycle_stage) { params.push(lifecycle_stage); query += ` AND lifecycle_stage = $${params.length}`; }
    if (source) { params.push(source); query += ` AND source = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM contacts');
    const byStage = await pool.query('SELECT lifecycle_stage, COUNT(*) as count FROM contacts GROUP BY lifecycle_stage');
    const byIndustry = await pool.query('SELECT industry, COUNT(*) as count FROM contacts GROUP BY industry ORDER BY count DESC');
    const byRegion = await pool.query('SELECT region, COUNT(*) as count FROM contacts GROUP BY region ORDER BY count DESC');
    const bySource = await pool.query('SELECT source, COUNT(*) as count FROM contacts GROUP BY source ORDER BY count DESC');
    res.json({
      total: parseInt(total.rows[0].count),
      byStage: byStage.rows,
      byIndustry: byIndustry.rows,
      byRegion: byRegion.rows,
      bySource: bySource.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single contact
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, company, industry, region, lifecycle_stage, source, interest } = req.body;
    const result = await pool.query(
      `INSERT INTO contacts (name, email, phone, company, industry, region, lifecycle_stage, source, interest)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, email, phone, company, industry, region, lifecycle_stage || 'new', source, interest]
    );
    await createNotification(req.user.id, 'contact', 'New Contact', `${name} added to CRM`, '/contacts');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update contact
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, company, industry, region, lifecycle_stage, source, interest } = req.body;
    const result = await pool.query(
      `UPDATE contacts SET name=$1, email=$2, phone=$3, company=$4, industry=$5, region=$6, lifecycle_stage=$7, source=$8, interest=$9
       WHERE id=$10 RETURNING *`,
      [name, email, phone, company, industry, region, lifecycle_stage, source, interest, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lifecycle stage only
router.patch('/:id/stage', authenticateToken, async (req, res) => {
  try {
    const { lifecycle_stage } = req.body;
    const result = await pool.query('UPDATE contacts SET lifecycle_stage = $1 WHERE id = $2 RETURNING *', [lifecycle_stage, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
