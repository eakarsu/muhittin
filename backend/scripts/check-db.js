#!/usr/bin/env node
const pool = require('../db');

async function checkDatabase() {
  const result = await pool.query(`
    SELECT
      to_regclass('public.users') AS users,
      to_regclass('public.opportunities') AS opportunities,
      to_regclass('public.opportunity_events') AS opportunity_events
  `);
  const missing = Object.entries(result.rows[0]).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`Missing database objects: ${missing.join(', ')}. Run the explicit migration commands.`);
  console.log('Database readiness check passed.');
}

checkDatabase()
  .catch((error) => {
    console.error(`Database readiness error: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
