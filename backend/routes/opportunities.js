const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');
const { sendOpportunityConfirmation } = require('../helpers/email');

// Public: Submit opportunity
router.post('/', async (req, res) => {
  try {
    const { company_name, contact_name, email, phone, opportunity_type, description, region, budget_range } = req.body;
    const result = await pool.query(
      `INSERT INTO opportunities (company_name, contact_name, email, phone, opportunity_type, description, region, budget_range)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [company_name, contact_name, email, phone, opportunity_type, description, region, budget_range]
    );
    res.status(201).json(result.rows[0]);

    // Automation: contact, notification, email
    try {
      const existingContact = await pool.query('SELECT id FROM contacts WHERE email = $1', [email]);
      if (existingContact.rows.length === 0) {
        await pool.query(
          'INSERT INTO contacts (name, email, phone, company, lifecycle_stage, source, interest) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [contact_name, email, phone, company_name, 'lead', 'opportunity', opportunity_type]
        );
      }

      const adminResult = await pool.query('SELECT id FROM users LIMIT 1');
      if (adminResult.rows.length > 0) {
        await createNotification({
          userId: adminResult.rows[0].id,
          type: 'opportunity',
          title: 'New Opportunity Submitted',
          message: `${contact_name} from ${company_name} submitted an opportunity`,
          link: '/admin/opportunities'
        });
      }

      sendOpportunityConfirmation(email, contact_name);
    } catch (automationErr) {
      console.error('Opportunity automation error:', automationErr.message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List opportunities with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, opportunity_type, search } = req.query;
    let query = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (opportunity_type) { params.push(opportunity_type); query += ` AND opportunity_type = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (company_name ILIKE $${params.length} OR contact_name ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single opportunity
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM opportunities WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update opportunity status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE opportunities SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
