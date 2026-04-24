const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, type, status, search } = req.query;
    let query = 'SELECT c.*, b.name as business_name FROM campaigns c LEFT JOIN businesses b ON c.business_id = b.id WHERE 1=1';
    const params = [];
    if (business_id) { params.push(business_id); query += ` AND c.business_id = $${params.length}`; }
    if (type) { params.push(type); query += ` AND c.type = $${params.length}`; }
    if (status) { params.push(status); query += ` AND c.status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (c.name ILIKE $${params.length} OR c.subject ILIKE $${params.length})`; }
    query += ' ORDER BY c.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM campaigns');
    const sent = await pool.query("SELECT COUNT(*) FROM campaigns WHERE status = 'sent'");
    const totalRecipients = await pool.query('SELECT SUM(recipients) as total FROM campaigns');
    const totalOpens = await pool.query('SELECT SUM(opens) as total FROM campaigns');
    const totalClicks = await pool.query('SELECT SUM(clicks) as total FROM campaigns');
    const byType = await pool.query('SELECT type, COUNT(*) as count FROM campaigns GROUP BY type');
    res.json({
      total: parseInt(total.rows[0].count),
      sent: parseInt(sent.rows[0].count),
      totalRecipients: parseInt(totalRecipients.rows[0].total || 0),
      totalOpens: parseInt(totalOpens.rows[0].total || 0),
      totalClicks: parseInt(totalClicks.rows[0].total || 0),
      byType: byType.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT c.*, b.name as business_name FROM campaigns c LEFT JOIN businesses b ON c.business_id = b.id WHERE c.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, name, type, subject, content, target_audience, status, scheduled_at } = req.body;
    const result = await pool.query(
      `INSERT INTO campaigns (business_id, name, type, subject, content, target_audience, status, scheduled_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [business_id, name, type || 'email', subject, content, target_audience, status || 'draft', scheduled_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { business_id, name, type, subject, content, target_audience, status, scheduled_at } = req.body;
    const result = await pool.query(
      `UPDATE campaigns SET business_id=$1, name=$2, type=$3, subject=$4, content=$5, target_audience=$6, status=$7, scheduled_at=$8
       WHERE id=$9 RETURNING *`,
      [business_id, name, type, subject, content, target_audience, status, scheduled_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send campaign
router.patch('/:id/send', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE campaigns SET status = 'sent', sent_at = NOW(), recipients = COALESCE(recipients, 0) + 100 WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    await createNotification(req.user.id, 'campaign', 'Campaign Sent', `${result.rows[0].name} has been sent`, '/campaigns');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM campaigns WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
