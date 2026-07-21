const { Pool } = require('pg');
const { getDatabaseConfig } = require('./config');

const { databaseUrl } = getDatabaseConfig();
const pool = new Pool({
  connectionString: databaseUrl,
  max: Number(process.env.DB_POOL_MAX || 10),
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 5000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
});

module.exports = pool;
