const jwt = require('jsonwebtoken');
const pool = require('../db');
const { getRuntimeConfig } = require('../config');

const TOKEN_ISSUER = 'multiverse-consulting-group';
const TOKEN_AUDIENCE = 'muhittin-admin';

function signToken(user, secret = getRuntimeConfig().jwtSecret) {
  return jwt.sign(
    { email: user.email, role: user.role, ver: Number(user.auth_version || 0) },
    secret,
    {
      algorithm: 'HS256',
      audience: TOKEN_AUDIENCE,
      expiresIn: '15m',
      issuer: TOKEN_ISSUER,
      subject: String(user.id),
    },
  );
}

function verifyToken(token, secret = getRuntimeConfig().jwtSecret) {
  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
    audience: TOKEN_AUDIENCE,
    issuer: TOKEN_ISSUER,
  });
}

function bearerToken(header) {
  const match = /^Bearer ([A-Za-z0-9._~-]+)$/.exec(String(header || ''));
  return match ? match[1] : null;
}

function createAuthenticateToken(database = pool, secret) {
  return async function authenticateToken(req, res, next) {
    const token = bearerToken(req.headers.authorization);
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    try {
      const decoded = verifyToken(token, secret);
      const result = await database.query(
        'SELECT id, email, role, active, auth_version FROM users WHERE id = $1',
        [decoded.sub],
      );
      const user = result.rows[0];
      if (!user || user.active !== true || Number(user.auth_version) !== Number(decoded.ver)) {
        return res.status(401).json({ error: 'Session is no longer valid' });
      }
      req.user = user;
      return next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError || error instanceof jwt.NotBeforeError) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }
      return next(error);
    }
  };
}

function createOptionalAuthenticateToken(database = pool, secret) {
  return async function optionalAuthenticateToken(req, _res, next) {
    const token = bearerToken(req.headers.authorization);
    if (!token) return next();
    try {
      const decoded = verifyToken(token, secret);
      const result = await database.query(
        'SELECT id, email, role, active, auth_version FROM users WHERE id = $1',
        [decoded.sub],
      );
      const user = result.rows[0];
      if (user && user.active === true && Number(user.auth_version) === Number(decoded.ver)) req.user = user;
      return next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError || error instanceof jwt.NotBeforeError) return next();
      return next(error);
    }
  };
}

function requireRole(...roles) {
  const allowed = new Set(roles);
  return function roleRequired(req, res, next) {
    if (!req.user || !allowed.has(req.user.role)) return res.status(403).json({ error: 'Insufficient permission' });
    return next();
  };
}

const authenticateToken = createAuthenticateToken();
const optionalAuthenticateToken = createOptionalAuthenticateToken();

module.exports = {
  TOKEN_AUDIENCE,
  TOKEN_ISSUER,
  authenticateToken,
  bearerToken,
  createAuthenticateToken,
  createOptionalAuthenticateToken,
  optionalAuthenticateToken,
  requireRole,
  signToken,
  verifyToken,
};
