'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/inMemoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'banking_app_super_secret_key_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Sign a JWT for the given user.
 * @param {{ id: string, username: string }} user
 * @returns {string}
 */
function signToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/signup
 * Body: { username: string, password: string }
 */
async function signup(req, res, next) {
  try {
    const { username, password } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const trimmedUsername = username.trim();

    // ── Uniqueness check ────────────────────────────────────────────────────
    if (store.findUserByUsername(trimmedUsername)) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // ── Persist ─────────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = store.createUser(trimmedUsername, passwordHash);

    const token = signToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { username: string, password: string }
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // ── Lookup ──────────────────────────────────────────────────────────────
    const user = store.findUserByUsername(username.trim());
    if (!user) {
      // Use a generic message to avoid username enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ── Password check ──────────────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };