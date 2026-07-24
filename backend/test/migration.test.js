const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Client } = require('pg');

const { runMigrations } = require('../migrate');

function quotedIdentifier(value) {
  if (!/^[a-z0-9_]+$/.test(value)) throw new TypeError('Unsafe database identifier');
  return `"${value}"`;
}

test('migration is repeatable and opportunity history is append-only', { timeout: 120_000 }, async (t) => {
  if (!process.env.DATABASE_URL) return t.skip('DATABASE_URL is required for the isolated migration test');
  const sourceUrl = new URL(process.env.DATABASE_URL);
  const databaseName = `muhittin_test_${crypto.randomBytes(6).toString('hex')}`;
  const adminUrl = new URL(sourceUrl);
  adminUrl.pathname = '/postgres';
  const testUrl = new URL(sourceUrl);
  testUrl.pathname = `/${databaseName}`;
  const admin = new Client({ connectionString: adminUrl.toString() });
  let database;

  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE ${quotedIdentifier(databaseName)}`);
    database = new Client({ connectionString: testUrl.toString() });
    await database.connect();
    await database.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'owner',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE opportunities (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255),
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        opportunity_type VARCHAR(100),
        description TEXT,
        region VARCHAR(100),
        budget_range VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await database.end();
    database = null;

    await runMigrations({ databaseUrl: testUrl.toString() });
    await runMigrations({ databaseUrl: testUrl.toString() });

    database = new Client({ connectionString: testUrl.toString() });
    await database.connect();
    const migrationCount = await database.query('SELECT COUNT(*)::int AS count FROM schema_migrations');
    assert.equal(migrationCount.rows[0].count, 3);

    const user = await database.query("INSERT INTO users (email, password, role) VALUES ('owner@example.com', 'hash', 'owner') RETURNING id, active, auth_version");
    assert.equal(user.rows[0].active, true);
    assert.equal(user.rows[0].auth_version, 0);
    const opportunity = await database.query("INSERT INTO opportunities (contact_name, status, idempotency_key, request_fingerprint, consent_recorded_at) VALUES ('Ada', 'new', 'migration-test-key-1234', repeat('a', 64), NOW()) RETURNING id");
    const event = await database.query(
      "INSERT INTO opportunity_events (opportunity_id, event_type, to_status, actor_role, request_id) VALUES ($1, 'submitted', 'new', 'public', 'request-123') RETURNING id",
      [opportunity.rows[0].id],
    );
    await database.query(
      "INSERT INTO opportunity_events (opportunity_id, event_type, from_status, to_status, actor_user_id, actor_role, request_id) VALUES ($1, 'status_changed', 'new', 'qualified', $2, 'owner', 'request-456')",
      [opportunity.rows[0].id, user.rows[0].id],
    );
    await assert.rejects(database.query('UPDATE opportunity_events SET note = $1 WHERE id = $2', ['tampered', event.rows[0].id]), /append-only/);
    await assert.rejects(database.query('DELETE FROM users WHERE id = $1', [user.rows[0].id]), /opportunity_events_actor_user_id_fkey/);
    await assert.rejects(database.query("INSERT INTO opportunities (contact_name, status) VALUES ('Bad', 'invalid')"), /opportunities_status_allowed/);
    await assert.rejects(database.query("INSERT INTO opportunities (contact_name, idempotency_key) VALUES ('Missing consent', 'missing-consent-key-1234')"), /opportunities_idempotency_contract/);
  } finally {
    if (database) await database.end().catch(() => {});
    await admin.query(
      'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
      [databaseName],
    ).catch(() => {});
    await admin.query(`DROP DATABASE IF EXISTS ${quotedIdentifier(databaseName)}`).catch(() => {});
    await admin.end();
  }
});
