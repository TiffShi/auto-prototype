'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'banking_app_super_secret_key_change_in_prod';

/**
 * Express middleware that verifies the JWT supplied in the
 * `Authorization: Bearer <token>` header.
 *
 * On success  → attaches `req.user = { userId, username }` and calls next().
 * On failure  → responds with 401 Unauthorized.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach decoded payload to request for downstream handlers
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;