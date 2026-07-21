import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('public submission uses the idempotent opportunity API contract', async () => {
  const page = await source('../src/pages/public/SubmitOpportunity.jsx');
  assert.match(page, /fetch\('\/api\/opportunities'/);
  assert.match(page, /'Idempotency-Key': submissionKey/);
  assert.match(page, /crypto\.randomUUID\(\)/);
  assert.match(page, /consent/);
  assert.match(page, /JSON\.stringify\(\{ \.\.\.form, consent \}\)/);
});

test('admin review uses transition and audit endpoints without fake CRUD calls', async () => {
  const page = await source('../src/pages/AdminOpportunities.jsx');
  assert.match(page, /\/status`/);
  assert.match(page, /\/events`/);
  assert.doesNotMatch(page, /method:\s*'DELETE'/);
  assert.doesNotMatch(page, /method:\s*'PUT'/);
});

test('browser sessions are not persisted across browser restarts', async () => {
  const context = await source('../src/context/AuthContext.jsx');
  assert.match(context, /sessionStorage/);
  assert.doesNotMatch(context, /localStorage/);
});
