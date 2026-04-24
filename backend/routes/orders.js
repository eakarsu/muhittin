const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// List orders with related info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { delivery_stage, search } = req.query;
    let query = `SELECT o.*, d.service_line as deal_service_line, c.name as contact_name, sp.name as package_name
       FROM orders o
       LEFT JOIN deals d ON o.deal_id = d.id
       LEFT JOIN contacts c ON o.contact_id = c.id
       LEFT JOIN service_packages sp ON o.service_package_id = sp.id
       WHERE 1=1`;
    const params = [];
    if (delivery_stage) { params.push(delivery_stage); query += ` AND o.delivery_stage = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (c.name ILIKE $${params.length} OR sp.name ILIKE $${params.length} OR d.service_line ILIKE $${params.length})`; }
    query += ' ORDER BY o.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order with all related info
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, d.service_line as deal_service_line, d.value as deal_value, c.name as contact_name, c.email as contact_email, sp.name as package_name, sp.price as package_price
       FROM orders o
       LEFT JOIN deals d ON o.deal_id = d.id
       LEFT JOIN contacts c ON o.contact_id = c.id
       LEFT JOIN service_packages sp ON o.service_package_id = sp.id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { deal_id, contact_id, service_package_id, payment_id, delivery_stage, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO orders (deal_id, contact_id, service_package_id, payment_id, delivery_stage, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [deal_id, contact_id, service_package_id, payment_id, delivery_stage || 'pending', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { deal_id, contact_id, service_package_id, payment_id, delivery_stage, notes } = req.body;
    const result = await pool.query(
      `UPDATE orders SET deal_id=$1, contact_id=$2, service_package_id=$3, payment_id=$4, delivery_stage=$5, notes=$6
       WHERE id=$7 RETURNING *`,
      [deal_id, contact_id, service_package_id, payment_id, delivery_stage, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update delivery stage only
router.patch('/:id/stage', authenticateToken, async (req, res) => {
  try {
    const { delivery_stage } = req.body;
    const result = await pool.query('UPDATE orders SET delivery_stage = $1 WHERE id = $2 RETURNING *', [delivery_stage, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
