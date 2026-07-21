const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../server');

test('health and readiness distinguish process health from required schema', async (t) => {
  let schemaReady = false;
  const database = {
    query: async () => ({
      rows: [schemaReady
        ? { users: 'users', opportunities: 'opportunities', opportunity_events: 'opportunity_events' }
        : { users: 'users', opportunities: 'opportunities', opportunity_events: null }],
    }),
  };
  const app = createApp({
    config: { trustProxy: false, corsOrigins: ['http://127.0.0.1:3000'], nodeEnv: 'test' },
    database,
  });
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff');

  const missingSchema = await fetch(`${baseUrl}/api/ready`);
  assert.equal(missingSchema.status, 503);
  schemaReady = true;
  const ready = await fetch(`${baseUrl}/api/ready`);
  assert.equal(ready.status, 200);
});
