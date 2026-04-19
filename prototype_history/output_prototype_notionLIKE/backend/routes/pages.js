'use strict';

const { Router } = require('express');
const store = require('../store/memoryStore');

const router = Router();

// ── GET /api/pages ────────────────────────────────────────────────────────────
// Returns the full page tree (nested structure)
router.get('/', (req, res, next) => {
  try {
    const tree = store.buildPageTree();
    res.json({ data: tree });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/pages/:id ────────────────────────────────────────────────────────
// Returns a single page with its blocks
router.get('/:id', (req, res, next) => {
  try {
    const page = store.getPageById(req.params.id);
    if (!page) {
      return res.status(404).json({ error: `Page '${req.params.id}' not found` });
    }

    const blocks = store.getBlocksForPage(req.params.id);
    res.json({ data: { ...page, blocks } });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/pages ───────────────────────────────────────────────────────────
// Create a new page
router.post('/', (req, res, next) => {
  try {
    const { title, parentId } = req.body || {};
    const page = store.createPage({ title, parentId });
    res.status(201).json({ data: page });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/pages/:id ────────────────────────────────────────────────────────
// Update page title / parentId
router.put('/:id', (req, res, next) => {
  try {
    const { title, parentId } = req.body || {};
    const page = store.updatePage(req.params.id, { title, parentId });
    res.json({ data: page });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/pages/:id ─────────────────────────────────────────────────────
// Delete a page and all its descendants
router.delete('/:id', (req, res, next) => {
  try {
    const deletedIds = store.deletePage(req.params.id);
    res.json({ data: { deletedIds } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;