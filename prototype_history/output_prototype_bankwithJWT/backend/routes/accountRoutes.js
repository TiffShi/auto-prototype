'use strict';

const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getBalance,
  depositFunds,
  withdrawFunds,
  getTransactions,
} = require('../controllers/accountController');

const router = Router();

// All account routes require a valid JWT
router.use(authMiddleware);

/**
 * GET /api/account/balance
 * Returns the current balance for the authenticated user.
 */
router.get('/balance', getBalance);

/**
 * POST /api/account/deposit
 * Body: { amount: number }
 * Deposits the specified amount into the authenticated user's account.
 */
router.post('/deposit', depositFunds);

/**
 * POST /api/account/withdraw
 * Body: { amount: number }
 * Withdraws the specified amount from the authenticated user's account.
 */
router.post('/withdraw', withdrawFunds);

/**
 * GET /api/account/transactions
 * Returns the full transaction history for the authenticated user.
 */
router.get('/transactions', getTransactions);

module.exports = router;