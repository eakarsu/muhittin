const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');
const { sendPartnerInquiryConfirmation } = require('../helpers/email');

// Public: Partnership inquiry
router.post('/', async (req, res) => {
  try {
    const { company_name, contact_name, email, phone, type, region, industry, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO partners (company_name, contact_name, email, phone, type, region, industry, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [company_name, contact_name, email, phone, type, region, industry, notes]
    );
    res.status(201).json(result.rows[0]);

    // Automation: contact, notification, email
    try {
      const existingContact = await pool.query('SELECT id FROM contacts WHERE email = $1', [email]);
      if (existingContact.rows.length === 0) {
        await pool.query(
          'INSERT INTO contacts (name, email, phone, company, lifecycle_stage, source, interest) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [contact_name, email, phone, company_name, 'lead', 'partnership', type]
        );
      }

      const adminResult = await pool.query('SELECT id FROM users LIMIT 1');
      if (adminResult.rows.length > 0) {
        await createNotification({
          userId: adminResult.rows[0].id,
          type: 'partner',
          title: 'New Partnership Inquiry',
          message: `${company_name} submitted a partnership inquiry`,
          link: '/admin/partners'
        });
      }

      sendPartnerInquiryConfirmation(email, contact_name, company_name);
    } catch (automationErr) {
      console.error('Partner automation error:', automationErr.message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List partners with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, region, industry, search } = req.query;
    let query = 'SELECT * FROM partners WHERE 1=1';
    const params = [];
    if (type) { params.push(type); query += ` AND type = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (region) { params.push(region); query += ` AND region = $${params.length}`; }
    if (industry) { params.push(industry); query += ` AND industry = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (company_name ILIKE $${params.length} OR contact_name ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Partner stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM partners');
    const byType = await pool.query('SELECT type, COUNT(*) as count FROM partners GROUP BY type ORDER BY count DESC');
    const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM partners GROUP BY status');
    const byRegion = await pool.query('SELECT region, COUNT(*) as count FROM partners GROUP BY region ORDER BY count DESC');
    res.json({
      total: parseInt(total.rows[0].count),
      byType: byType.rows,
      byStatus: byStatus.rows,
      byRegion: byRegion.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single partner
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM partners WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Partner not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update partner
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { company_name, contact_name, email, phone, type, status, region, industry, notes } = req.body;
    const result = await pool.query(
      `UPDATE partners SET company_name=$1, contact_name=$2, email=$3, phone=$4, type=$5, status=$6, region=$7, industry=$8, notes=$9
       WHERE id=$10 RETURNING *`,
      [company_name, contact_name, email, phone, type, status, region, industry, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Partner not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update partner status only
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE partners SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Partner not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete partner
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM partners WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Partner not found' });
    res.json({ message: 'Partner deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
