const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');
const { sendCandidateWelcome } = require('../helpers/email');

// Public: Talent signup
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, industry, experience_years, region, role_level, compensation_min, compensation_max, skills, resume_url, linkedin_url, availability, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO candidates (name, email, phone, industry, experience_years, region, role_level, compensation_min, compensation_max, skills, resume_url, linkedin_url, availability, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [name, email, phone, industry, experience_years, region, role_level, compensation_min, compensation_max, skills, resume_url, linkedin_url, availability, notes]
    );
    res.status(201).json(result.rows[0]);

    // Automation: contact, notification, email
    try {
      const existingContact = await pool.query('SELECT id FROM contacts WHERE email = $1', [email]);
      if (existingContact.rows.length === 0) {
        await pool.query(
          'INSERT INTO contacts (name, email, phone, company, lifecycle_stage, source, interest) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [name, email, phone, null, 'visitor', 'talent_network', role_level + ' - ' + industry]
        );
      }

      const adminResult = await pool.query('SELECT id FROM users LIMIT 1');
      if (adminResult.rows.length > 0) {
        await createNotification({
          userId: adminResult.rows[0].id,
          type: 'candidate',
          title: 'New Talent Network Signup',
          message: `${name} joined the talent network (${role_level})`,
          link: '/admin/candidates'
        });
      }

      sendCandidateWelcome(email, name);
    } catch (automationErr) {
      console.error('Candidate automation error:', automationErr.message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List candidates with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { industry, region, role_level, availability, status, search } = req.query;
    let query = 'SELECT * FROM candidates WHERE 1=1';
    const params = [];
    if (industry) { params.push(industry); query += ` AND industry = $${params.length}`; }
    if (region) { params.push(region); query += ` AND region = $${params.length}`; }
    if (role_level) { params.push(role_level); query += ` AND role_level = $${params.length}`; }
    if (availability) { params.push(availability); query += ` AND availability = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR skills ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Candidate stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM candidates');
    const byStatus = await pool.query('SELECT status, COUNT(*) as count FROM candidates GROUP BY status');
    const byRoleLevel = await pool.query('SELECT role_level, COUNT(*) as count FROM candidates GROUP BY role_level ORDER BY count DESC');
    const byIndustry = await pool.query('SELECT industry, COUNT(*) as count FROM candidates GROUP BY industry ORDER BY count DESC');
    const byRegion = await pool.query('SELECT region, COUNT(*) as count FROM candidates GROUP BY region ORDER BY count DESC');
    res.json({
      total: parseInt(total.rows[0].count),
      byStatus: byStatus.rows,
      byRoleLevel: byRoleLevel.rows,
      byIndustry: byIndustry.rows,
      byRegion: byRegion.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single candidate
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update candidate
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, industry, experience_years, region, role_level, compensation_min, compensation_max, skills, resume_url, linkedin_url, availability, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE candidates SET name=$1, email=$2, phone=$3, industry=$4, experience_years=$5, region=$6, role_level=$7, compensation_min=$8, compensation_max=$9, skills=$10, resume_url=$11, linkedin_url=$12, availability=$13, status=$14, notes=$15
       WHERE id=$16 RETURNING *`,
      [name, email, phone, industry, experience_years, region, role_level, compensation_min, compensation_max, skills, resume_url, linkedin_url, availability, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update candidate status only
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE candidates SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete candidate
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
