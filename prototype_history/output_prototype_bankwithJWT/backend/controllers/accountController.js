'use strict';

const store = require('../data/inMemoryStore');

/**
 * Parse and validate a monetary amount from the request body.
 * Returns the numeric value or throws a descriptive error.
 *
 * @param {*} raw  The raw value from req.body
 * @returns {number}
 */
function parseAmount(raw) {
  if (raw === undefined || raw === null || raw === '') {
    throw Object.assign(new Error('Amount is required'), { status: 400 });
  }
  const amount = Number(raw);
  if (Number.isNaN(amount)) {
    throw Object.assign(new Error('Amount must be a valid number'), { status: 400 });
  }
  if (amount <= 0) {
    throw Object.assign(new Error('Amount must be greater than zero'), { status: 400 });
  }
  // Limit to 2 decimal places to avoid floating-point surprises
  return parseFloat(amount.toFixed(2));
}

/**
 * GET /api/account/balance
 * Returns the authenticated user's current balance.
 */
function getBalance(req, res, next) {
  try {
    const user = store.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }
    return res.status(200).json({ balance: user.balance });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/account/deposit
 * Body: { amount: number }
 */
function depositFunds(req, res, next) {
  try {
    const amount = parseAmount(req.body.amount);
    const result = store.deposit(req.user.userId, amount);
    return res.status(200).json({
      message: `Successfully deposited $${amount.toFixed(2)}`,
      balance: result.balance,
      transaction: result.transaction,
    });
  } catch (err) {
    if (!err.status) err.status = 400;
    next(err);
  }
}

/**
 * POST /api/account/withdraw
 * Body: { amount: number }
 */
function withdrawFunds(req, res, next) {
  try {
    const amount = parseAmount(req.body.amount);
    const result = store.withdraw(req.user.userId, amount);
    return res.status(200).json({
      message: `Successfully withdrew $${amount.toFixed(2)}`,
      balance: result.balance,
      transaction: result.transaction,
    });
  } catch (err) {
    if (!err.status) err.status = 400;
    next(err);
  }
}

/**
 * GET /api/account/transactions
 * Returns the authenticated user's transaction history (newest first).
 */
function getTransactions(req, res, next) {
  try {
    const transactions = store.getTransactions(req.user.userId);
    return res.status(200).json({ transactions });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBalance,
  depositFunds,
  withdrawFunds,
  getTransactions,
};