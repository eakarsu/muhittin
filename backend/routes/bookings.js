const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, status, date, search } = req.query;
    let query = `SELECT b.*, c.name as customer_name FROM bookings b LEFT JOIN customers c ON b.customer_id = c.id WHERE 1=1`;
    const params = [];
    if (business_id) { params.push(business_id); query += ` AND b.business_id = $${params.length}`; }
    if (status) { params.push(status); query += ` AND b.status = $${params.length}`; }
    if (date) { params.push(date); query += ` AND b.date = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (b.service_name ILIKE $${params.length} OR c.name ILIKE $${params.length})`; }
    query += ' ORDER BY b.date DESC, b.time_slot ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM bookings');
    const upcoming = await pool.query("SELECT COUNT(*) FROM bookings WHERE status IN ('scheduled','confirmed') AND date >= CURRENT_DATE");
    const completed = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'completed'");
    const revenue = await pool.query("SELECT SUM(price) as total FROM bookings WHERE status = 'completed'");
    const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM bookings GROUP BY status');
    res.json({
      total: parseInt(total.rows[0].count),
      upcoming: parseInt(upcoming.rows[0].count),
      completed: parseInt(completed.rows[0].count),
      revenue: parseFloat(revenue.rows[0].total || 0),
      byStatus: byStatus.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.name as customer_name FROM bookings b LEFT JOIN customers c ON b.customer_id = c.id WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, customer_id, service_name, date, time_slot, duration_minutes, price, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO bookings (business_id, customer_id, service_name, date, time_slot, duration_minutes, price, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [business_id, customer_id, service_name, date, time_slot, duration_minutes || 60, price, status || 'scheduled', notes]
    );
    await createNotification(req.user.id, 'booking', 'New Booking', `${service_name} booked for ${date}`, '/bookings');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { business_id, customer_id, service_name, date, time_slot, duration_minutes, price, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE bookings SET business_id=$1, customer_id=$2, service_name=$3, date=$4, time_slot=$5, duration_minutes=$6, price=$7, status=$8, notes=$9
       WHERE id=$10 RETURNING *`,
      [business_id, customer_id, service_name, date, time_slot, duration_minutes, price, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
