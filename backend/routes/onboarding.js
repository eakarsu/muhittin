const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// List all onboarding workflows
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `SELECT o.*, c.name as contact_name, co.name as company_name
                 FROM onboarding_workflows o
                 LEFT JOIN contacts c ON o.contact_id = c.id
                 LEFT JOIN companies co ON o.company_id = co.id WHERE 1=1`;
    const params = [];
    if (status) { params.push(status); query += ` AND o.status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (o.service ILIKE $${params.length} OR c.name ILIKE $${params.length})`; }
    query += ' ORDER BY o.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM onboarding_workflows');
    const active = await pool.query("SELECT COUNT(*) FROM onboarding_workflows WHERE status = 'in_progress'");
    const completed = await pool.query("SELECT COUNT(*) FROM onboarding_workflows WHERE status = 'completed'");
    const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM onboarding_workflows GROUP BY status');
    res.json({
      total: parseInt(total.rows[0].count),
      active: parseInt(active.rows[0].count),
      completed: parseInt(completed.rows[0].count),
      byStatus: byStatus.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, c.name as contact_name, c.email as contact_email, co.name as company_name
       FROM onboarding_workflows o
       LEFT JOIN contacts c ON o.contact_id = c.id
       LEFT JOIN companies co ON o.company_id = co.id
       WHERE o.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { deal_id, contact_id, company_id, service, milestone_1, milestone_2, milestone_3, milestone_4 } = req.body;
    const result = await pool.query(
      `INSERT INTO onboarding_workflows (deal_id, contact_id, company_id, service, status, milestone_1, milestone_2, milestone_3, milestone_4)
       VALUES ($1,$2,$3,$4,'initiated',$5,$6,$7,$8) RETURNING *`,
      [deal_id, contact_id, company_id, service, milestone_1 || 'Discovery & Kickoff', milestone_2 || 'Strategy Development', milestone_3 || 'Execution & Delivery', milestone_4 || 'Review & Handoff']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update workflow step
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const fields = req.body;
    const sets = [];
    const params = [];
    Object.entries(fields).forEach(([key, value]) => {
      if (['payment_received', 'welcome_email_sent', 'kickoff_scheduled', 'kickoff_date',
           'internal_project_created', 'project_notes', 'milestone_1', 'milestone_1_done',
           'milestone_2', 'milestone_2_done', 'milestone_3', 'milestone_3_done',
           'milestone_4', 'milestone_4_done', 'status', 'completed_at', 'service'].includes(key)) {
        params.push(value);
        sets.push(`${key} = $${params.length}`);
      }
    });
    if (sets.length === 0) return res.status(400).json({ error: 'No valid fields' });
    params.push(req.params.id);
    const result = await pool.query(
      `UPDATE onboarding_workflows SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM onboarding_workflows WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
