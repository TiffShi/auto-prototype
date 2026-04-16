'use strict';

const { randomUUID } = require('crypto');

// ── In-memory stores ──────────────────────────────────────────────────────────
/** @type {Record<string, Page>} */
const pages = {};

/** @type {Record<string, Block[]>} */
const blocks = {};

// ── Seed data ─────────────────────────────────────────────────────────────────
(function seed() {
  const pageId = randomUUID();
  const now = new Date().toISOString();

  pages[pageId] = {
    id: pageId,
    title: 'Getting Started',
    parentId: null,
    createdAt: now,
    updatedAt: now,
  };

  blocks[pageId] = [
    {
      id: randomUUID(),
      type: 'heading1',
      content: 'Welcome to Notion-Like App 👋',
      checked: false,
      order: 0,
    },
    {
      id: randomUUID(),
      type: 'text',
      content:
        'This is your workspace. Create pages, write notes, and organise your thoughts.',
      checked: false,
      order: 1,
    },
    {
      id: randomUUID(),
      type: 'heading2',
      content: 'What you can do',
      checked: false,
      order: 2,
    },
    {
      id: randomUUID(),
      type: 'bullet',
      content: 'Create nested pages from the sidebar',
      checked: false,
      order: 3,
    },
    {
      id: randomUUID(),
      type: 'bullet',
      content: 'Use the / command to change block types',
      checked: false,
      order: 4,
    },
    {
      id: randomUUID(),
      type: 'bullet',
      content: 'Drag and drop blocks to reorder them',
      checked: false,
      order: 5,
    },
    {
      id: randomUUID(),
      type: 'todo',
      content: 'Try checking off this todo item',
      checked: false,
      order: 6,
    },
    {
      id: randomUUID(),
      type: 'todo',
      content: 'Create your first page',
      checked: false,
      order: 7,
    },
    {
      id: randomUUID(),
      type: 'divider',
      content: '',
      checked: false,
      order: 8,
    },
    {
      id: randomUUID(),
      type: 'text',
      content: 'Happy writing! ✨',
      checked: false,
      order: 9,
    },
  ];

  // ── Second seed page (child) ───────────────────────────────────────────────
  const childPageId = randomUUID();
  pages[childPageId] = {
    id: childPageId,
    title: 'Quick Notes',
    parentId: pageId,
    createdAt: now,
    updatedAt: now,
  };

  blocks[childPageId] = [
    {
      id: randomUUID(),
      type: 'heading1',
      content: 'Quick Notes',
      checked: false,
      order: 0,
    },
    {
      id: randomUUID(),
      type: 'text',
      content: 'Jot down anything here.',
      checked: false,
      order: 1,
    },
  ];
})();

// ── Page helpers ──────────────────────────────────────────────────────────────

/**
 * Return all pages as an array.
 * @returns {Page[]}
 */
function getAllPages() {
  return Object.values(pages);
}

/**
 * Return a single page by id, or undefined.
 * @param {string} id
 * @returns {Page|undefined}
 */
function getPageById(id) {
  return pages[id];
}

/**
 * Create a new page.
 * @param {{ title?: string, parentId?: string|null }} data
 * @returns {Page}
 */
function createPage({ title = 'Untitled', parentId = null } = {}) {
  const id = randomUUID();
  const now = new Date().toISOString();

  // Validate parentId if provided
  if (parentId && !pages[parentId]) {
    const err = new Error(`Parent page '${parentId}' not found`);
    err.status = 404;
    throw err;
  }

  const page = { id, title, parentId: parentId || null, createdAt: now, updatedAt: now };
  pages[id] = page;
  blocks[id] = [];
  return page;
}

/**
 * Update a page's mutable fields.
 * @param {string} id
 * @param {{ title?: string, parentId?: string|null }} data
 * @returns {Page}
 */
function updatePage(id, { title, parentId } = {}) {
  const page = pages[id];
  if (!page) {
    const err = new Error(`Page '${id}' not found`);
    err.status = 404;
    throw err;
  }

  if (title !== undefined) page.title = title;
  if (parentId !== undefined) {
    if (parentId !== null && !pages[parentId]) {
      const err = new Error(`Parent page '${parentId}' not found`);
      err.status = 404;
      throw err;
    }
    // Prevent circular nesting
    if (parentId === id) {
      const err = new Error('A page cannot be its own parent');
      err.status = 400;
      throw err;
    }
    page.parentId = parentId;
  }

  page.updatedAt = new Date().toISOString();
  return page;
}

/**
 * Delete a page and all its descendants recursively, plus their blocks.
 * @param {string} id
 * @returns {string[]} ids of all deleted pages
 */
function deletePage(id) {
  if (!pages[id]) {
    const err = new Error(`Page '${id}' not found`);
    err.status = 404;
    throw err;
  }

  const toDelete = collectDescendants(id);
  toDelete.forEach((pid) => {
    delete pages[pid];
    delete blocks[pid];
  });

  return toDelete;
}

/**
 * Collect a page id and all its descendant ids (BFS).
 * @param {string} rootId
 * @returns {string[]}
 */
function collectDescendants(rootId) {
  const result = [];
  const queue = [rootId];

  while (queue.length) {
    const current = queue.shift();
    result.push(current);
    const children = Object.values(pages)
      .filter((p) => p.parentId === current)
      .map((p) => p.id);
    queue.push(...children);
  }

  return result;
}

/**
 * Build a nested page tree.
 * @returns {PageNode[]}
 */
function buildPageTree() {
  const allPages = getAllPages();
  const map = {};

  allPages.forEach((p) => {
    map[p.id] = { ...p, children: [] };
  });

  const roots = [];
  allPages.forEach((p) => {
    if (p.parentId && map[p.parentId]) {
      map[p.parentId].children.push(map[p.id]);
    } else {
      roots.push(map[p.id]);
    }
  });

  return roots;
}

// ── Block helpers ─────────────────────────────────────────────────────────────

const VALID_BLOCK_TYPES = [
  'text',
  'heading1',
  'heading2',
  'heading3',
  'todo',
  'bullet',
  'numbered',
  'divider',
];

/**
 * Return all blocks for a page, sorted by order.
 * @param {string} pageId
 * @returns {Block[]}
 */
function getBlocksForPage(pageId) {
  if (!pages[pageId]) {
    const err = new Error(`Page '${pageId}' not found`);
    err.status = 404;
    throw err;
  }
  return [...(blocks[pageId] || [])].sort((a, b) => a.order - b.order);
}

/**
 * Add a block to a page.
 * @param {string} pageId
 * @param {{ type?: string, content?: string, checked?: boolean, order?: number }} data
 * @returns {Block}
 */
function addBlock(pageId, { type = 'text', content = '', checked = false, order } = {}) {
  if (!pages[pageId]) {
    const err = new Error(`Page '${pageId}' not found`);
    err.status = 404;
    throw err;
  }

  if (!VALID_BLOCK_TYPES.includes(type)) {
    const err = new Error(`Invalid block type '${type}'`);
    err.status = 400;
    throw err;
  }

  const pageBlocks = blocks[pageId] || [];

  // Default order: append at end
  const resolvedOrder =
    order !== undefined ? order : pageBlocks.length > 0
      ? Math.max(...pageBlocks.map((b) => b.order)) + 1
      : 0;

  const block = {
    id: randomUUID(),
    type,
    content,
    checked: type === 'todo' ? Boolean(checked) : false,
    order: resolvedOrder,
  };

  pageBlocks.push(block);
  blocks[pageId] = pageBlocks;

  // Update page updatedAt
  if (pages[pageId]) pages[pageId].updatedAt = new Date().toISOString();

  return block;
}

/**
 * Update a block.
 * @param {string} pageId
 * @param {string} blockId
 * @param {{ type?: string, content?: string, checked?: boolean, order?: number }} data
 * @returns {Block}
 */
function updateBlock(pageId, blockId, { type, content, checked, order } = {}) {
  if (!pages[pageId]) {
    const err = new Error(`Page '${pageId}' not found`);
    err.status = 404;
    throw err;
  }

  const pageBlocks = blocks[pageId] || [];
  const block = pageBlocks.find((b) => b.id === blockId);

  if (!block) {
    const err = new Error(`Block '${blockId}' not found on page '${pageId}'`);
    err.status = 404;
    throw err;
  }

  if (type !== undefined) {
    if (!VALID_BLOCK_TYPES.includes(type)) {
      const err = new Error(`Invalid block type '${type}'`);
      err.status = 400;
      throw err;
    }
    block.type = type;
  }
  if (content !== undefined) block.content = content;
  if (checked !== undefined) block.checked = Boolean(checked);
  if (order !== undefined) block.order = order;

  if (pages[pageId]) pages[pageId].updatedAt = new Date().toISOString();

  return block;
}

/**
 * Delete a block from a page.
 * @param {string} pageId
 * @param {string} blockId
 * @returns {Block} the deleted block
 */
function deleteBlock(pageId, blockId) {
  if (!pages[pageId]) {
    const err = new Error(`Page '${pageId}' not found`);
    err.status = 404;
    throw err;
  }

  const pageBlocks = blocks[pageId] || [];
  const idx = pageBlocks.findIndex((b) => b.id === blockId);

  if (idx === -1) {
    const err = new Error(`Block '${blockId}' not found on page '${pageId}'`);
    err.status = 404;
    throw err;
  }

  const [deleted] = pageBlocks.splice(idx, 1);
  blocks[pageId] = pageBlocks;

  if (pages[pageId]) pages[pageId].updatedAt = new Date().toISOString();

  return deleted;
}

/**
 * Reorder blocks for a page given an ordered array of block ids.
 * @param {string} pageId
 * @param {string[]} orderedIds
 * @returns {Block[]}
 */
function reorderBlocks(pageId, orderedIds) {
  if (!pages[pageId]) {
    const err = new Error(`Page '${pageId}' not found`);
    err.status = 404;
    throw err;
  }

  if (!Array.isArray(orderedIds)) {
    const err = new Error('orderedIds must be an array');
    err.status = 400;
    throw err;
  }

  const pageBlocks = blocks[pageId] || [];

  // Validate all ids exist
  const blockMap = {};
  pageBlocks.forEach((b) => {
    blockMap[b.id] = b;
  });

  for (const bid of orderedIds) {
    if (!blockMap[bid]) {
      const err = new Error(`Block '${bid}' not found on page '${pageId}'`);
      err.status = 404;
      throw err;
    }
  }

  // Assign new order values
  orderedIds.forEach((bid, idx) => {
    blockMap[bid].order = idx;
  });

  // Rebuild array in new order
  blocks[pageId] = orderedIds.map((bid) => blockMap[bid]);

  if (pages[pageId]) pages[pageId].updatedAt = new Date().toISOString();

  return [...blocks[pageId]];
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  // Pages
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  buildPageTree,
  // Blocks
  getBlocksForPage,
  addBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  VALID_BLOCK_TYPES,
};