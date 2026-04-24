const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, search, status, source } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    if (business_id) { params.push(business_id); query += ` AND business_id = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (source) { params.push(source); query += ` AND source = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM customers');
    const active = await pool.query("SELECT COUNT(*) FROM customers WHERE status = 'active'");
    const totalSpent = await pool.query('SELECT SUM(total_spent) as total FROM customers');
    const avgVisits = await pool.query('SELECT AVG(visit_count) as avg FROM customers');
    const bySrc = await pool.query('SELECT source, COUNT(*) as count FROM customers GROUP BY source ORDER BY count DESC');
    res.json({
      total: parseInt(total.rows[0].count),
      active: parseInt(active.rows[0].count),
      totalSpent: parseFloat(totalSpent.rows[0].total || 0),
      avgVisits: parseFloat(avgVisits.rows[0].avg || 0).toFixed(1),
      bySource: bySrc.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, name, email, phone, address, city, tags, source, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO customers (business_id, name, email, phone, address, city, tags, source, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [business_id, name, email, phone, address, city, tags, source, status || 'active', notes]
    );
    await createNotification(req.user.id, 'customer', 'New Customer', `${name} added to your CRM`, '/customers');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { business_id, name, email, phone, address, city, tags, source, status, notes, total_spent, visit_count, last_visit } = req.body;
    const result = await pool.query(
      `UPDATE customers SET business_id=$1, name=$2, email=$3, phone=$4, address=$5, city=$6, tags=$7, source=$8, status=$9, notes=$10, total_spent=$11, visit_count=$12, last_visit=$13
       WHERE id=$14 RETURNING *`,
      [business_id, name, email, phone, address, city, tags, source, status, notes, total_spent, visit_count, last_visit, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
