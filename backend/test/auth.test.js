const test = require('node:test');
const assert = require('node:assert/strict');

const {
  bearerToken,
  createAuthenticateToken,
  requireRole,
  signToken,
  verifyToken,
} = require('../middleware/auth');

const SECRET = 'A9x_secure-random-value-for-tests_2026_Zz';
const USER = { id: 7, email: 'staff@example.com', role: 'manager', active: true, auth_version: 3 };

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('session tokens are scoped, short lived, and versioned', () => {
  const token = signToken(USER, SECRET);
  const decoded = verifyToken(token, SECRET);
  assert.equal(decoded.sub, '7');
  assert.equal(decoded.role, 'manager');
  assert.equal(decoded.ver, 3);
  assert.equal(decoded.aud, 'muhittin-admin');
  assert.ok(decoded.exp - decoded.iat <= 15 * 60);
  assert.throws(() => verifyToken(token, `${SECRET}different`));
});

test('bearer parsing is strict', () => {
  assert.equal(bearerToken('Bearer abc.def-ghi_jkl'), 'abc.def-ghi_jkl');
  assert.equal(bearerToken('bearer token'), null);
  assert.equal(bearerToken('Bearer token extra'), null);
});

test('authentication rechecks active status and token version', async () => {
  const token = signToken(USER, SECRET);
  const database = { query: async () => ({ rows: [{ ...USER }] }) };
  const middleware = createAuthenticateToken(database, SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = responseRecorder();
  let continued = false;
  await middleware(req, res, () => { continued = true; });
  assert.equal(continued, true);
  assert.equal(req.user.id, USER.id);

  const revoked = createAuthenticateToken({ query: async () => ({ rows: [{ ...USER, auth_version: 4 }] }) }, SECRET);
  const revokedRes = responseRecorder();
  await revoked({ headers: { authorization: `Bearer ${token}` } }, revokedRes, () => assert.fail('revoked token continued'));
  assert.equal(revokedRes.statusCode, 401);
  assert.match(revokedRes.body.error, /no longer valid/);

  const databaseFailure = new Error('database unavailable');
  const failing = createAuthenticateToken({ query: async () => { throw databaseFailure; } }, SECRET);
  let forwarded;
  await failing({ headers: { authorization: `Bearer ${token}` } }, responseRecorder(), (error) => { forwarded = error; });
  assert.equal(forwarded, databaseFailure);
});

test('role middleware denies users outside the allowed set', () => {
  const middleware = requireRole('owner', 'admin');
  const denied = responseRecorder();
  middleware({ user: USER }, denied, () => assert.fail('manager should not continue'));
  assert.equal(denied.statusCode, 403);

  let continued = false;
  middleware({ user: { ...USER, role: 'owner' } }, responseRecorder(), () => { continued = true; });
  assert.equal(continued, true);
});
