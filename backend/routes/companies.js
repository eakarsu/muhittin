const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// List companies with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { industry, size, region, search } = req.query;
    let query = 'SELECT * FROM companies WHERE 1=1';
    const params = [];
    if (industry) { params.push(industry); query += ` AND industry = $${params.length}`; }
    if (size) { params.push(size); query += ` AND size = $${params.length}`; }
    if (region) { params.push(region); query += ` AND region = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND name ILIKE $${params.length}`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single company with related counts
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const company = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    if (company.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    const contactsCount = await pool.query('SELECT COUNT(*) FROM contacts WHERE company = (SELECT name FROM companies WHERE id = $1)', [req.params.id]);
    const dealsCount = await pool.query('SELECT COUNT(*) FROM deals WHERE company_id = $1', [req.params.id]);
    res.json({
      ...company.rows[0],
      contacts_count: parseInt(contactsCount.rows[0].count),
      deals_count: parseInt(dealsCount.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create company
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, industry, size, region, website, relationship_owner, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO companies (name, industry, size, region, website, relationship_owner, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, industry, size, region, website, relationship_owner, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update company
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, industry, size, region, website, relationship_owner, notes } = req.body;
    const result = await pool.query(
      `UPDATE companies SET name=$1, industry=$2, size=$3, region=$4, website=$5, relationship_owner=$6, notes=$7
       WHERE id=$8 RETURNING *`,
      [name, industry, size, region, website, relationship_owner, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete company
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
