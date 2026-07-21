const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env'), override: false });

const PLACEHOLDER_SECRET = /(change.?me|default|example|muhittin[_-]?jwt|secret[_-]?key|demo)/i;

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error('Boolean configuration values must be "true" or "false".');
}

function validateDatabaseUrl(value) {
  if (!value) throw new Error('DATABASE_URL is required.');
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL.');
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname || !parsed.pathname.slice(1)) {
    throw new Error('DATABASE_URL must identify a PostgreSQL host and database.');
  }
  return value;
}

function validateJwtSecret(value) {
  if (!value || value.length < 32 || value.length > 512 || PLACEHOLDER_SECRET.test(value)) {
    throw new Error('JWT_SECRET must be a non-placeholder value containing 32 through 512 characters.');
  }
  return value;
}

function parseOrigins(value, nodeEnv) {
  const origins = String(value || '').split(',').map((origin) => origin.trim()).filter(Boolean);
  if (nodeEnv === 'production' && origins.length === 0) throw new Error('CORS_ORIGINS is required in production.');
  for (const origin of origins) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error('Each CORS_ORIGINS entry must be an absolute HTTP(S) origin.');
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.pathname !== '/' || parsed.search || parsed.hash || parsed.username || parsed.password) {
      throw new Error('Each CORS_ORIGINS entry must be an HTTP(S) origin without credentials, path, query, or fragment.');
    }
  }
  return origins;
}

function parsePort(value, name, fallback) {
  const port = Number(value || fallback);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error(`${name} must be an integer from 1024 through 65535.`);
  return port;
}

function getDatabaseConfig(environment = process.env) {
  return { databaseUrl: validateDatabaseUrl(environment.DATABASE_URL) };
}

function getRuntimeConfig(environment = process.env) {
  const nodeEnv = environment.NODE_ENV || 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('NODE_ENV must be development, test, or production.');
  return Object.freeze({
    ...getDatabaseConfig(environment),
    nodeEnv,
    backendPort: parsePort(environment.BACKEND_PORT, 'BACKEND_PORT', 3001),
    frontendPort: parsePort(environment.FRONTEND_PORT, 'FRONTEND_PORT', 3000),
    jwtSecret: validateJwtSecret(environment.JWT_SECRET),
    corsOrigins: parseOrigins(environment.CORS_ORIGINS, nodeEnv),
    trustProxy: parseBoolean(environment.TRUST_PROXY, false),
    allowPublicRegistration: parseBoolean(environment.ALLOW_PUBLIC_REGISTRATION, false),
  });
}

module.exports = {
  getDatabaseConfig,
  getRuntimeConfig,
  parseBoolean,
  parseOrigins,
  validateDatabaseUrl,
  validateJwtSecret,
};
