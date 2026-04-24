const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

// List meetings with contact and company info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, date_from, date_to, search } = req.query;
    let query = `SELECT m.*, c.name as contact_name, co.name as company_name
       FROM meetings m
       LEFT JOIN contacts c ON m.contact_id = c.id
       LEFT JOIN companies co ON m.company_id = co.id
       WHERE 1=1`;
    const params = [];
    if (status) { params.push(status); query += ` AND m.status = $${params.length}`; }
    if (type) { params.push(type); query += ` AND m.type = $${params.length}`; }
    if (date_from) { params.push(date_from); query += ` AND m.date >= $${params.length}`; }
    if (date_to) { params.push(date_to); query += ` AND m.date <= $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (m.title ILIKE $${params.length})`; }
    query += ' ORDER BY m.date DESC NULLS LAST, m.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Meeting stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM meetings');
    const upcoming = await pool.query('SELECT COUNT(*) FROM meetings WHERE date >= CURRENT_DATE');
    const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM meetings GROUP BY status');
    const byType = await pool.query('SELECT type, COUNT(*) as count FROM meetings GROUP BY type ORDER BY count DESC');
    res.json({
      total: parseInt(total.rows[0].count),
      upcoming: parseInt(upcoming.rows[0].count),
      byStatus: byStatus.rows,
      byType: byType.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single meeting with contact and company info
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, c.name as contact_name, c.email as contact_email, co.name as company_name
       FROM meetings m
       LEFT JOIN contacts c ON m.contact_id = c.id
       LEFT JOIN companies co ON m.company_id = co.id
       WHERE m.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meeting not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create meeting
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { contact_id, company_id, deal_id, title, type, date, time, duration_minutes, location, attendees, notes, status } = req.body;
    const result = await pool.query(
      `INSERT INTO meetings (contact_id, company_id, deal_id, title, type, date, time, duration_minutes, location, attendees, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [contact_id || null, company_id || null, deal_id || null, title, type || 'consultation', date, time, duration_minutes || 60, location, attendees, notes, status || 'scheduled']
    );
    await createNotification(req.user.id, 'meeting', 'Meeting Scheduled', `Meeting Scheduled: ${title}`, '/admin/meetings');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update meeting
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { contact_id, company_id, deal_id, title, type, date, time, duration_minutes, location, attendees, notes, status } = req.body;
    const result = await pool.query(
      `UPDATE meetings SET contact_id=$1, company_id=$2, deal_id=$3, title=$4, type=$5, date=$6, time=$7, duration_minutes=$8, location=$9, attendees=$10, notes=$11, status=$12
       WHERE id=$13 RETURNING *`,
      [contact_id || null, company_id || null, deal_id || null, title, type, date, time, duration_minutes, location, attendees, notes, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meeting not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update meeting status only
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE meetings SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meeting not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete meeting
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM meetings WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ message: 'Meeting deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
