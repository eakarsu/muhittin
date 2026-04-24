const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// List payments with deal and contact info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `SELECT p.*, d.service_line as deal_service_line, c.name as contact_name, c.email as contact_email
       FROM payments p
       LEFT JOIN deals d ON p.deal_id = d.id
       LEFT JOIN contacts c ON p.contact_id = c.id
       WHERE 1=1`;
    const params = [];
    if (status) { params.push(status); query += ` AND p.status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND p.service ILIKE $${params.length}`; }
    query += ' ORDER BY p.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM payments');
    const totalAmount = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments');
    const byStatus = await pool.query('SELECT status, COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount FROM payments GROUP BY status');
    const byCurrency = await pool.query('SELECT currency, COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount FROM payments GROUP BY currency');
    res.json({
      total: parseInt(total.rows[0].count),
      totalAmount: parseFloat(totalAmount.rows[0].total),
      byStatus: byStatus.rows,
      byCurrency: byCurrency.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single payment with deal and contact info
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, d.service_line as deal_service_line, d.value as deal_value, c.name as contact_name, c.email as contact_email
       FROM payments p
       LEFT JOIN deals d ON p.deal_id = d.id
       LEFT JOIN contacts c ON p.contact_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { deal_id, contact_id, amount, currency, service, status, stripe_payment_id, stripe_invoice_id, receipt_url } = req.body;
    const result = await pool.query(
      `INSERT INTO payments (deal_id, contact_id, amount, currency, service, status, stripe_payment_id, stripe_invoice_id, receipt_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [deal_id, contact_id, amount, currency || 'usd', service, status || 'pending', stripe_payment_id, stripe_invoice_id, receipt_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update payment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE payments SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
