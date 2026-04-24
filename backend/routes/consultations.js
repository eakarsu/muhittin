const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');
const { sendConsultationConfirmation } = require('../helpers/email');

// Public: Book a consultation
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, service_interest, message, preferred_date, preferred_time } = req.body;
    const result = await pool.query(
      `INSERT INTO consultations (name, email, phone, company, service_interest, message, preferred_date, preferred_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, email, phone, company, service_interest, message, preferred_date, preferred_time]
    );
    res.status(201).json(result.rows[0]);

    // Automation: contact, notification, email
    try {
      const existingContact = await pool.query('SELECT id FROM contacts WHERE email = $1', [email]);
      if (existingContact.rows.length === 0) {
        await pool.query(
          'INSERT INTO contacts (name, email, phone, company, lifecycle_stage, source, interest) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [name, email, phone, company, 'lead', 'consultation', service_interest]
        );
      }

      const adminResult = await pool.query('SELECT id FROM users LIMIT 1');
      if (adminResult.rows.length > 0) {
        await createNotification({
          userId: adminResult.rows[0].id,
          type: 'consultation',
          title: 'New Consultation Request',
          message: `${name} from ${company} requested a consultation`,
          link: '/admin/consultations'
        });
      }

      sendConsultationConfirmation(email, name, service_interest, preferred_date);
    } catch (automationErr) {
      console.error('Consultation automation error:', automationErr.message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List consultations with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM consultations WHERE 1=1';
    const params = [];
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR company ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Consultation stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM consultations');
    const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM consultations GROUP BY status');
    const upcoming = await pool.query('SELECT COUNT(*) FROM consultations WHERE preferred_date >= NOW()');
    res.json({
      total: parseInt(total.rows[0].count),
      byStatus: byStatus.rows,
      upcoming: parseInt(upcoming.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single consultation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM consultations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Consultation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update consultation status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE consultations SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Consultation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
