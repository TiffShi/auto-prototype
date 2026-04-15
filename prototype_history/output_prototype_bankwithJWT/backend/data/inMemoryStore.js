'use strict';

/**
 * In-memory data store.
 *
 * User shape:
 * {
 *   id:           string   (uuid-like)
 *   username:     string
 *   passwordHash: string   (bcrypt hash)
 *   balance:      number   (always >= 0)
 *   transactions: Transaction[]
 * }
 *
 * Transaction shape:
 * {
 *   id:        string
 *   type:      'deposit' | 'withdrawal'
 *   amount:    number
 *   balanceAfter: number
 *   createdAt: string  (ISO 8601)
 * }
 */

const users = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a simple unique ID (no external dependency needed).
 * @returns {string}
 */
function generateId() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36)
  );
}

// ── User operations ───────────────────────────────────────────────────────────

/**
 * Find a user by username (case-insensitive).
 * @param {string} username
 * @returns {object|undefined}
 */
function findUserByUsername(username) {
  return users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

/**
 * Find a user by their ID.
 * @param {string} id
 * @returns {object|undefined}
 */
function findUserById(id) {
  return users.find((u) => u.id === id);
}

/**
 * Create and persist a new user.
 * @param {string} username
 * @param {string} passwordHash
 * @returns {object} The newly created user
 */
function createUser(username, passwordHash) {
  const user = {
    id: generateId(),
    username,
    passwordHash,
    balance: 0,
    transactions: [],
  };
  users.push(user);
  return user;
}

// ── Account operations ────────────────────────────────────────────────────────

/**
 * Deposit an amount into a user's account.
 * @param {string} userId
 * @param {number} amount  Must be > 0
 * @returns {{ balance: number, transaction: object }}
 */
function deposit(userId, amount) {
  const user = findUserById(userId);
  if (!user) throw new Error('User not found');
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Deposit amount must be a positive number');
  }

  user.balance = parseFloat((user.balance + amount).toFixed(2));

  const transaction = {
    id: generateId(),
    type: 'deposit',
    amount: parseFloat(amount.toFixed(2)),
    balanceAfter: user.balance,
    createdAt: new Date().toISOString(),
  };
  user.transactions.push(transaction);

  return { balance: user.balance, transaction };
}

/**
 * Withdraw an amount from a user's account.
 * @param {string} userId
 * @param {number} amount  Must be > 0 and <= current balance
 * @returns {{ balance: number, transaction: object }}
 */
function withdraw(userId, amount) {
  const user = findUserById(userId);
  if (!user) throw new Error('User not found');
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Withdrawal amount must be a positive number');
  }
  if (amount > user.balance) {
    const insufficientFundsError = new Error('Insufficient funds');
    insufficientFundsError.status = 422;
    throw insufficientFundsError;
  }

  user.balance = parseFloat((user.balance - amount).toFixed(2));

  const transaction = {
    id: generateId(),
    type: 'withdrawal',
    amount: parseFloat(amount.toFixed(2)),
    balanceAfter: user.balance,
    createdAt: new Date().toISOString(),
  };
  user.transactions.push(transaction);

  return { balance: user.balance, transaction };
}

/**
 * Retrieve all transactions for a user, newest first.
 * @param {string} userId
 * @returns {object[]}
 */
function getTransactions(userId) {
  const user = findUserById(userId);
  if (!user) throw new Error('User not found');
  return [...user.transactions].reverse();
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  deposit,
  withdraw,
  getTransactions,
};