const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { getRuntimeConfig } = require('../config');
const { authenticateToken, signToken } = require('../middleware/auth');

const router = express.Router();

function validateEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new TypeError('A valid email is required');
  return email;
}

function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    throw new TypeError('Password must contain 12 through 128 characters with upper-case, lower-case, and numeric characters');
  }
  return value;
}

router.post('/register', async (req, res, next) => {
  try {
    if (!getRuntimeConfig().allowPublicRegistration) return res.status(404).json({ error: 'Not found' });
    const email = validateEmail(req.body?.email);
    const password = validatePassword(req.body?.password);
    const name = String(req.body?.name || '').trim();
    const phone = req.body?.phone ? String(req.body.phone).trim() : null;
    if (name.length < 2 || name.length > 255 || (phone && phone.length > 50)) throw new TypeError('Valid name and phone values are required');

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, password, name, phone, role, active, auth_version)
       VALUES ($1, $2, $3, $4, 'viewer', TRUE, 0)
       RETURNING id, email, name, phone, role, active, auth_version`,
      [email, hashedPassword, name, phone],
    );
    const user = result.rows[0];
    return res.status(201).json({ token: signToken(user), user });
  } catch (error) {
    if (error instanceof TypeError) return res.status(400).json({ error: error.message });
    if (error.code === '23505') return res.status(409).json({ error: 'Account already exists' });
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = validateEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!password || password.length > 128) return res.status(401).json({ error: 'Invalid credentials' });
    const result = await pool.query(
      'SELECT id, email, password, name, phone, role, active, auth_version FROM users WHERE email = $1',
      [email],
    );
    const user = result.rows[0];
    const valid = user ? await bcrypt.compare(password, user.password) : await bcrypt.compare(password, '$2a$12$b2IsNi4ncTU7padFuFRc1e5ozDcxbQLSi/BD.IupqYxN66Pf09xhe');
    if (!user || !valid || user.active !== true) return res.status(401).json({ error: 'Invalid credentials' });
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      active: user.active,
      auth_version: user.auth_version,
    };
    return res.json({ token: signToken(safeUser), user: safeUser });
  } catch (error) {
    if (error instanceof TypeError) return res.status(400).json({ error: error.message });
    return next(error);
  }
});

router.get('/me', authenticateToken, (req, res) => {
  const { id, email, role } = req.user;
  return res.json({ id, email, role });
});

module.exports = router;
module.exports.validateEmail = validateEmail;
module.exports.validatePassword = validatePassword;
