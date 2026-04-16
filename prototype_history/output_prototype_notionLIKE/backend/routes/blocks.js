'use strict';

const { Router } = require('express');
const store = require('../store/memoryStore');

// Use mergeParams so we can access :id from the parent router
const router = Router({ mergeParams: true });

// ── GET /api/pages/:id/blocks ─────────────────────────────────────────────────
// Get all blocks for a page (sorted by order)
router.get('/:id/blocks', (req, res, next) => {
  try {
    const blocks = store.getBlocksForPage(req.params.id);
    res.json({ data: blocks });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/pages/:id/blocks ────────────────────────────────────────────────
// Add a new block to a page
router.post('/:id/blocks', (req, res, next) => {
  try {
    const { type, content, checked, order } = req.body || {};
    const block = store.addBlock(req.params.id, { type, content, checked, order });
    res.status(201).json({ data: block });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/pages/:id/blocks/reorder ─────────────────────────────────────────
// Reorder blocks — MUST be defined before /:id/blocks/:blockId to avoid conflict
router.put('/:id/blocks/reorder', (req, res, next) => {
  try {
    const { orderedIds } = req.body || {};

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array of block ids' });
    }

    const blocks = store.reorderBlocks(req.params.id, orderedIds);
    res.json({ data: blocks });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/pages/:id/blocks/:blockId ───────────────────────────────────────
// Update a specific block
router.put('/:id/blocks/:blockId', (req, res, next) => {
  try {
    const { type, content, checked, order } = req.body || {};
    const block = store.updateBlock(req.params.id, req.params.blockId, {
      type,
      content,
      checked,
      order,
    });
    res.json({ data: block });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/pages/:id/blocks/:blockId ─────────────────────────────────────
// Delete a specific block
router.delete('/:id/blocks/:blockId', (req, res, next) => {
  try {
    const block = store.deleteBlock(req.params.id, req.params.blockId);
    res.json({ data: block });
  } catch (err) {
    next(err);
  }
});

module.exports = router;