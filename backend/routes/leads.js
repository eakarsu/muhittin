const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, status, source, search } = req.query;
    let query = 'SELECT l.*, b.name as business_name FROM leads l LEFT JOIN businesses b ON l.business_id = b.id WHERE 1=1';
    const params = [];
    if (business_id) { params.push(business_id); query += ` AND l.business_id = $${params.length}`; }
    if (status) { params.push(status); query += ` AND l.status = $${params.length}`; }
    if (source) { params.push(source); query += ` AND l.source = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (l.name ILIKE $${params.length} OR l.email ILIKE $${params.length})`; }
    query += ' ORDER BY l.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM leads');
    const newLeads = await pool.query("SELECT COUNT(*) FROM leads WHERE status = 'new'");
    const won = await pool.query("SELECT COUNT(*) FROM leads WHERE status = 'won'");
    const totalValue = await pool.query('SELECT SUM(value) as total FROM leads');
    const wonValue = await pool.query("SELECT SUM(value) as total FROM leads WHERE status = 'won'");
    const byStatus = await pool.query('SELECT status, COUNT(*) as count, SUM(value) as total_value FROM leads GROUP BY status');
    const bySource = await pool.query('SELECT source, COUNT(*) as count FROM leads GROUP BY source ORDER BY count DESC');
    res.json({
      total: parseInt(total.rows[0].count),
      new: parseInt(newLeads.rows[0].count),
      won: parseInt(won.rows[0].count),
      totalValue: parseFloat(totalValue.rows[0].total || 0),
      wonValue: parseFloat(wonValue.rows[0].total || 0),
      byStatus: byStatus.rows,
      bySource: bySource.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT l.*, b.name as business_name FROM leads l LEFT JOIN businesses b ON l.business_id = b.id WHERE l.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, name, email, phone, source, status, value, notes, follow_up_date } = req.body;
    const result = await pool.query(
      `INSERT INTO leads (business_id, name, email, phone, source, status, value, notes, follow_up_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [business_id, name, email, phone, source, status || 'new', value, notes, follow_up_date]
    );
    await createNotification(req.user.id, 'lead', 'New Lead', `${name} added to pipeline`, '/leads');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { business_id, name, email, phone, source, status, value, notes, follow_up_date } = req.body;
    const result = await pool.query(
      `UPDATE leads SET business_id=$1, name=$2, email=$3, phone=$4, source=$5, status=$6, value=$7, notes=$8, follow_up_date=$9
       WHERE id=$10 RETURNING *`,
      [business_id, name, email, phone, source, status, value, notes, follow_up_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lead status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE leads SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
