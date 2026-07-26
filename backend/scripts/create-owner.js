#!/usr/bin/env node
const bcrypt = require('bcryptjs');
const pool = require('../db');

function validateOwnerInput(environment = process.env) {
  const email = String(
    environment.BOOTSTRAP_OWNER_EMAIL || environment.BOOTSTRAP_ADMIN_EMAIL || environment.PROVISION_ADMIN_EMAIL || '',
  ).trim().toLowerCase();
  const name = String(
    environment.BOOTSTRAP_OWNER_NAME || environment.BOOTSTRAP_ADMIN_NAME || environment.PROVISION_ADMIN_NAME || '',
  ).trim();
  const password = environment.BOOTSTRAP_OWNER_PASSWORD || environment.BOOTSTRAP_ADMIN_PASSWORD || environment.PROVISION_ADMIN_PASSWORD;
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new TypeError('BOOTSTRAP_OWNER_EMAIL must be a valid email address.');
  if (name.length < 2 || name.length > 255) throw new TypeError('BOOTSTRAP_OWNER_NAME must contain 2 through 255 characters.');
  if (typeof password !== 'string' || password.length < 12 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new TypeError('BOOTSTRAP_OWNER_PASSWORD must contain 12 through 128 characters with upper-case, lower-case, and numeric characters.');
  }
  return { email, name, password };
}

async function createOwner(environment = process.env) {
  const input = validateOwnerInput(environment);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('muhittin-owner-bootstrap'))");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const existing = await client.query('SELECT id FROM users WHERE email=$1 FOR UPDATE', [input.email]);
    if (existing.rows[0]) {
      await client.query(
        `UPDATE users SET password=$1,name=$2,role='owner',active=TRUE,auth_version=auth_version+1 WHERE id=$3`,
        [passwordHash, input.name, existing.rows[0].id],
      );
    } else {
      const privileged = await client.query("SELECT id FROM users WHERE role IN ('owner', 'admin') ORDER BY id LIMIT 1 FOR UPDATE");
      if (privileged.rowCount) {
        if (environment.NODE_ENV === 'production') throw new Error('A different privileged account already exists; owner bootstrap refused.');
        await client.query(
          `UPDATE users SET email=$1,password=$2,name=$3,role='owner',active=TRUE,auth_version=auth_version+1 WHERE id=$4`,
          [input.email, passwordHash, input.name, privileged.rows[0].id],
        );
      } else {
        await client.query(
          `INSERT INTO users (email, password, name, role, active, auth_version)
           VALUES ($1, $2, $3, 'owner', TRUE, 0)`,
          [input.email, passwordHash, input.name],
        );
      }
    }
    await client.query('COMMIT');
    console.log('Configured owner account is ready.');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  createOwner()
    .catch((error) => {
      console.error(`Owner bootstrap failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { createOwner, validateOwnerInput };
