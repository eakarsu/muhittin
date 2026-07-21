const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { escapeHtml } = require('../helpers/email');
const { validateOwnerInput } = require('../scripts/create-owner');
const { createRateLimiter } = require('../middleware/rateLimit');

test('opportunity email data is HTML escaped', () => {
  assert.equal(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
});

test('owner bootstrap requires strong one-time input', () => {
  assert.deepEqual(validateOwnerInput({
    BOOTSTRAP_OWNER_EMAIL: ' Owner@Example.com ',
    BOOTSTRAP_OWNER_NAME: 'Initial Owner',
    BOOTSTRAP_OWNER_PASSWORD: 'CorrectHorse9Battery',
  }), {
    email: 'owner@example.com',
    name: 'Initial Owner',
    password: 'CorrectHorse9Battery',
  });
  assert.throws(() => validateOwnerInput({
    BOOTSTRAP_OWNER_EMAIL: 'owner@example.com',
    BOOTSTRAP_OWNER_NAME: 'Owner',
    BOOTSTRAP_OWNER_PASSWORD: 'weak-password',
  }), /upper-case, lower-case, and numeric/);
});

test('startup scripts do not install dependencies, reset data, or kill unrelated processes', () => {
  const root = path.join(__dirname, '..', '..');
  for (const filename of ['start.sh', 'docker-start.sh']) {
    const script = fs.readFileSync(path.join(root, filename), 'utf8');
    assert.doesNotMatch(script, /npm\s+(?:i|install|ci)\b/);
    assert.doesNotMatch(script, /\bseed(?:\.js)?\b/);
    assert.doesNotMatch(script, /kill\s+-9|pkill|killall/);
  }
});

test('public rate limiting rejects requests beyond the configured window', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, key: () => 'test-client' });
  const response = {
    headers: {}, statusCode: 200, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let continued = 0;
  limiter({}, response, () => { continued += 1; });
  limiter({}, response, () => { continued += 1; });
  limiter({}, response, () => { continued += 1; });
  assert.equal(continued, 2);
  assert.equal(response.statusCode, 429);
  assert.equal(response.headers['RateLimit-Remaining'], '0');
  assert.match(response.body.error, /Too many requests/);
});
