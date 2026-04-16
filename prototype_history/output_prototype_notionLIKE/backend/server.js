'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const pagesRouter = require('./routes/pages');
const blocksRouter = require('./routes/blocks');

const app = express();
const PORT = 8080;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/pages', pagesRouter);
app.use('/api/pages', blocksRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Backend listening on http://localhost:${PORT}`);
});

module.exports = app;