const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  pool = new Pool({
    user: process.env.DB_USER || 'erolakarsu',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'muhittin_platform'
  });
}

module.exports = pool;
