const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { getDatabaseConfig } = require('./config');

async function runMigrations({ databaseUrl = getDatabaseConfig().databaseUrl, directory = path.join(__dirname, 'migrations') } = {}) {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        sha256 CHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const files = fs.readdirSync(directory).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
    for (const name of files) {
      const sql = fs.readFileSync(path.join(directory, name), 'utf8');
      const sha256 = crypto.createHash('sha256').update(sql).digest('hex');
      await client.query('BEGIN');
      try {
        await client.query("SELECT pg_advisory_xact_lock(hashtext('muhittin-schema-migrations'))");
        const existing = await client.query('SELECT sha256 FROM schema_migrations WHERE name = $1', [name]);
        if (existing.rows.length) {
          if (existing.rows[0].sha256 !== sha256) throw new Error(`Applied migration ${name} has changed`);
          await client.query('COMMIT');
          continue;
        }
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name, sha256) VALUES ($1, $2)', [name, sha256]);
        await client.query('COMMIT');
        console.log(`Applied migration: ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    return files;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations().catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { runMigrations };
