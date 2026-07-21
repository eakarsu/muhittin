const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getRuntimeConfig,
  parseBoolean,
  parseOrigins,
  validateDatabaseUrl,
  validateJwtSecret,
} = require('../config');

const VALID_SECRET = 'r4nd0m-value-with-enough-entropy-2026-x7Qp';

test('runtime configuration accepts an explicit secure configuration', () => {
  const config = getRuntimeConfig({
    DATABASE_URL: 'postgresql://app@localhost:5432/muhittin',
    JWT_SECRET: VALID_SECRET,
    NODE_ENV: 'production',
    CORS_ORIGINS: 'https://example.com,https://admin.example.com',
    BACKEND_PORT: '3101',
    FRONTEND_PORT: '3100',
    TRUST_PROXY: 'true',
    ALLOW_PUBLIC_REGISTRATION: 'false',
  });

  assert.equal(config.backendPort, 3101);
  assert.deepEqual(config.corsOrigins, ['https://example.com', 'https://admin.example.com']);
  assert.equal(config.trustProxy, true);
  assert.equal(config.allowPublicRegistration, false);
});

test('unsafe secrets and non-PostgreSQL database URLs are rejected', () => {
  assert.throws(() => validateJwtSecret('change-me-secret-key'), /non-placeholder/);
  assert.throws(() => validateJwtSecret('short'), /32 through 512/);
  assert.throws(() => validateDatabaseUrl('mysql://localhost/example'), /PostgreSQL/);
  assert.throws(() => validateDatabaseUrl('postgresql://localhost'), /database/);
});

test('production requires canonical HTTP(S) origins and strict booleans', () => {
  assert.throws(() => parseOrigins('', 'production'), /required/);
  assert.throws(() => parseOrigins('https://example.com/path', 'production'), /without credentials, path/);
  assert.throws(() => parseOrigins('javascript:alert(1)', 'production'), /HTTP\(S\)/);
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('false'), false);
  assert.throws(() => parseBoolean('yes'), /must be "true" or "false"/);
});
