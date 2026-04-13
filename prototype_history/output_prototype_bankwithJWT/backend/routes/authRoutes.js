'use strict';

const { Router } = require('express');
const { signup, login } = require('../controllers/authController');

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user and return a JWT.
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Authenticate an existing user and return a JWT.
 */
router.post('/login', login);

module.exports = router;