const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Public: List active packages
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_packages WHERE active = true ORDER BY price ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Get single package by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_packages WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create package
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, slug, domain, description, price, price_type, stripe_price_id, stripe_product_id, delivery_workflow } = req.body;
    const result = await pool.query(
      `INSERT INTO service_packages (name, slug, domain, description, price, price_type, stripe_price_id, stripe_product_id, delivery_workflow)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, slug, domain, description, price, price_type, stripe_price_id, stripe_product_id, delivery_workflow]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update package
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, slug, domain, description, price, price_type, stripe_price_id, stripe_product_id, delivery_workflow, active } = req.body;
    const result = await pool.query(
      `UPDATE service_packages SET name=$1, slug=$2, domain=$3, description=$4, price=$5, price_type=$6, stripe_price_id=$7, stripe_product_id=$8, delivery_workflow=$9, active=$10
       WHERE id=$11 RETURNING *`,
      [name, slug, domain, description, price, price_type, stripe_price_id, stripe_product_id, delivery_workflow, active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft delete package (set active=false)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('UPDATE service_packages SET active = false WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
