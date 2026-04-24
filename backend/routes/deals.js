const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

// List deals with contact and company info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { opportunity_type, service_line, stage, region, search } = req.query;
    let query = `SELECT d.*, c.name as contact_name, co.name as company_name
       FROM deals d
       LEFT JOIN contacts c ON d.contact_id = c.id
       LEFT JOIN companies co ON d.company_id = co.id
       WHERE 1=1`;
    const params = [];
    if (opportunity_type) { params.push(opportunity_type); query += ` AND d.opportunity_type = $${params.length}`; }
    if (service_line) { params.push(service_line); query += ` AND d.service_line = $${params.length}`; }
    if (stage) { params.push(stage); query += ` AND d.stage = $${params.length}`; }
    if (region) { params.push(region); query += ` AND d.region = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (c.name ILIKE $${params.length} OR co.name ILIKE $${params.length} OR d.service_line ILIKE $${params.length})`; }
    query += ' ORDER BY d.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deal stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM deals');
    const byStage = await pool.query('SELECT stage, COUNT(*) as count, COALESCE(SUM(value), 0) as total_value FROM deals GROUP BY stage');
    const pipelineValue = await pool.query('SELECT COALESCE(SUM(value), 0) as total FROM deals');
    const wonValue = await pool.query("SELECT COALESCE(SUM(value), 0) as total FROM deals WHERE stage = 'won'");
    const byType = await pool.query('SELECT opportunity_type, COUNT(*) as count FROM deals GROUP BY opportunity_type ORDER BY count DESC');
    res.json({
      total: parseInt(total.rows[0].count),
      byStage: byStage.rows,
      pipelineValue: parseFloat(pipelineValue.rows[0].total),
      wonValue: parseFloat(wonValue.rows[0].total),
      byOpportunityType: byType.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single deal with contact and company info
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, c.name as contact_name, c.email as contact_email, co.name as company_name
       FROM deals d
       LEFT JOIN contacts c ON d.contact_id = c.id
       LEFT JOIN companies co ON d.company_id = co.id
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create deal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { contact_id, company_id, opportunity_type, service_line, value, stage, close_date, region, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO deals (contact_id, company_id, opportunity_type, service_line, value, stage, close_date, region, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [contact_id, company_id, opportunity_type, service_line, value, stage || 'discovery', close_date, region, notes]
    );
    await createNotification(req.user.id, 'deal', 'New Deal', `New ${opportunity_type} deal created`, '/deals');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update deal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { contact_id, company_id, opportunity_type, service_line, value, stage, close_date, region, notes } = req.body;
    const result = await pool.query(
      `UPDATE deals SET contact_id=$1, company_id=$2, opportunity_type=$3, service_line=$4, value=$5, stage=$6, close_date=$7, region=$8, notes=$9
       WHERE id=$10 RETURNING *`,
      [contact_id, company_id, opportunity_type, service_line, value, stage, close_date, region, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update deal stage only
router.patch('/:id/stage', authenticateToken, async (req, res) => {
  try {
    const { stage } = req.body;
    const result = await pool.query('UPDATE deals SET stage = $1 WHERE id = $2 RETURNING *', [stage, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete deal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM deals WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deal not found' });
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
