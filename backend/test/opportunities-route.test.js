const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const { createOpportunitiesRouter } = require('../routes/opportunities');

function createFakeDatabase() {
  const state = { opportunities: [], events: [] };
  const query = async (sql, params = []) => {
    const normalized = sql.replace(/\s+/g, ' ').trim();
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(normalized)) return { rows: [] };
    if (normalized.startsWith('INSERT INTO opportunities')) {
      const existing = state.opportunities.find((row) => row.idempotency_key === params[8]);
      if (existing) return { rows: [] };
      const row = {
        id: state.opportunities.length + 1,
        company_name: params[0], contact_name: params[1], email: params[2], phone: params[3],
        opportunity_type: params[4], description: params[5], region: params[6], budget_range: params[7],
        status: 'new', idempotency_key: params[8], request_fingerprint: params[9], consent_recorded_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      state.opportunities.push(row);
      return { rows: [{ id: row.id, status: row.status, created_at: row.created_at }] };
    }
    if (normalized.startsWith('INSERT INTO opportunity_events')) {
      const statusChange = normalized.includes("'status_changed'");
      const event = statusChange
        ? { id: state.events.length + 1, opportunity_id: params[0], event_type: 'status_changed', from_status: params[1], to_status: params[2], actor_user_id: params[3], actor_role: params[4], request_id: params[5], note: params[6], created_at: new Date().toISOString() }
        : { id: state.events.length + 1, opportunity_id: params[0], event_type: 'submitted', from_status: null, to_status: 'new', actor_user_id: null, actor_role: 'public', request_id: params[1], note: null, created_at: new Date().toISOString() };
      state.events.push(event);
      return { rows: [event] };
    }
    if (normalized.startsWith('SELECT id, status, created_at, request_fingerprint FROM opportunities WHERE idempotency_key')) {
      const row = state.opportunities.find((candidate) => candidate.idempotency_key === params[0]);
      return { rows: row ? [{ id: row.id, status: row.status, created_at: row.created_at, request_fingerprint: row.request_fingerprint }] : [] };
    }
    if (normalized.includes('FROM opportunity_events WHERE opportunity_id')) {
      return { rows: state.events.filter((event) => event.opportunity_id === params[0]) };
    }
    if (normalized.startsWith('SELECT id, status FROM opportunities')) {
      const row = state.opportunities.find((candidate) => candidate.id === params[0]);
      return { rows: row ? [{ id: row.id, status: row.status }] : [] };
    }
    if (normalized.startsWith('UPDATE opportunities SET status')) {
      const row = state.opportunities.find((candidate) => candidate.id === params[1]);
      row.status = params[0];
      row.updated_at = new Date().toISOString();
      return { rows: [{ id: row.id, status: row.status, updated_at: row.updated_at }] };
    }
    if (normalized.includes('FROM opportunities WHERE id =')) {
      const row = state.opportunities.find((candidate) => candidate.id === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (normalized.includes('FROM opportunities WHERE 1=1')) return { rows: [...state.opportunities] };
    throw new Error(`Unhandled fake query: ${normalized}`);
  };
  return {
    state,
    query,
    connect: async () => ({ query, release() {} }),
  };
}

async function startTestServer() {
  const database = createFakeDatabase();
  const identity = (req, _res, next) => { req.user = { id: 10, role: 'manager' }; next(); };
  const app = express();
  app.use(express.json());
  app.use('/api/opportunities', createOpportunitiesRouter({
    database,
    authenticate: identity,
    canRead: (_req, _res, next) => next(),
    canTransition: (_req, _res, next) => next(),
    postSubmission: async () => {},
  }));
  app.use((error, _req, res, _next) => res.status(500).json({ error: error.message }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  return { database, server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

const submission = {
  company_name: 'Example Company', contact_name: 'Ada Lovelace', email: 'ada@example.com',
  phone: '+1 212 555 0100', opportunity_type: 'Consulting Project',
  description: 'A complete opportunity description for an integration test.',
  region: 'North America', budget_range: '$50k-$100k',
  consent: true,
};

test('submission is idempotent and status transitions create audit history', async (t) => {
  const { database, server, baseUrl } = await startTestServer();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const missingKey = await fetch(`${baseUrl}/api/opportunities`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(submission),
  });
  assert.equal(missingKey.status, 400);

  const headers = { 'content-type': 'application/json', 'idempotency-key': 'submission_1234567890' }; // gitleaks:allow -- deterministic test fixture
  const created = await fetch(`${baseUrl}/api/opportunities`, { method: 'POST', headers, body: JSON.stringify(submission) });
  const createdBody = await created.json();
  assert.equal(created.status, 201);
  assert.equal(createdBody.replayed, false);

  const replayed = await fetch(`${baseUrl}/api/opportunities`, { method: 'POST', headers, body: JSON.stringify(submission) });
  assert.equal(replayed.status, 200);
  assert.equal((await replayed.json()).replayed, true);
  assert.equal(database.state.opportunities.length, 1);
  assert.equal(database.state.events.length, 1);

  const invalidId = await fetch(`${baseUrl}/api/opportunities/999999999999999999/status`, {
    method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'qualified' }),
  });
  assert.equal(invalidId.status, 400);

  const conflictingReplay = await fetch(`${baseUrl}/api/opportunities`, {
    method: 'POST', headers, body: JSON.stringify({ ...submission, company_name: 'Different Company' }),
  });
  assert.equal(conflictingReplay.status, 409);

  const qualified = await fetch(`${baseUrl}/api/opportunities/${createdBody.id}/status`, {
    method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'qualified', note: 'Fits our services' }),
  });
  assert.equal(qualified.status, 200);

  const invalid = await fetch(`${baseUrl}/api/opportunities/${createdBody.id}/status`, {
    method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'reviewing' }),
  });
  assert.equal(invalid.status, 409);

  const closeWithoutReason = await fetch(`${baseUrl}/api/opportunities/${createdBody.id}/status`, {
    method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'closed' }),
  });
  assert.equal(closeWithoutReason.status, 409);

  const closed = await fetch(`${baseUrl}/api/opportunities/${createdBody.id}/status`, {
    method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'closed', note: 'Outside scope' }),
  });
  assert.equal(closed.status, 200);

  const events = await fetch(`${baseUrl}/api/opportunities/${createdBody.id}/events`);
  const eventBody = await events.json();
  assert.equal(events.status, 200);
  assert.deepEqual(eventBody.map((event) => event.event_type), ['submitted', 'status_changed', 'status_changed']);
  assert.equal(eventBody.at(-1).note, 'Outside scope');
});
