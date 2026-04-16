import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '@/api/index.js';

export const usePageStore = defineStore('pages', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const pageTree = ref([]);
  const currentPage = ref(null);
  const currentBlocks = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // ── Getters ────────────────────────────────────────────────────────────────
  const flatPages = computed(() => {
    const result = [];
    const flatten = (nodes) => {
      nodes.forEach((node) => {
        result.push(node);
        if (node.children?.length) flatten(node.children);
      });
    };
    flatten(pageTree.value);
    return result;
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchPages() {
    try {
      loading.value = true;
      error.value = null;
      const res = await api.getPages();
      pageTree.value = res.data.data;
    } catch (err) {
      error.value = err.message;
      console.error('[fetchPages]', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPage(id) {
    try {
      loading.value = true;
      error.value = null;
      const res = await api.getPage(id);
      currentPage.value = res.data.data;
      currentBlocks.value = res.data.data.blocks || [];
    } catch (err) {
      error.value = err.message;
      console.error('[fetchPage]', err);
    } finally {
      loading.value = false;
    }
  }

  async function addPage(parentId = null) {
    try {
      const res = await api.createPage({ title: 'Untitled', parentId });
      await fetchPages();
      return res.data.data;
    } catch (err) {
      error.value = err.message;
      console.error('[addPage]', err);
    }
  }

  async function renamePage(id, title) {
    try {
      const res = await api.updatePage(id, { title });
      // Update in tree
      await fetchPages();
      // Update current page if it's the one being renamed
      if (currentPage.value?.id === id) {
        currentPage.value = { ...currentPage.value, title };
      }
      return res.data.data;
    } catch (err) {
      error.value = err.message;
      console.error('[renamePage]', err);
    }
  }

  async function removePage(id) {
    try {
      await api.deletePage(id);
      if (currentPage.value?.id === id) {
        currentPage.value = null;
        currentBlocks.value = [];
      }
      await fetchPages();
    } catch (err) {
      error.value = err.message;
      console.error('[removePage]', err);
    }
  }

  // ── Block actions ──────────────────────────────────────────────────────────

  async function addBlock(pageId, blockData) {
    try {
      const res = await api.createBlock(pageId, blockData);
      const newBlock = res.data.data;
      currentBlocks.value.push(newBlock);
      currentBlocks.value.sort((a, b) => a.order - b.order);
      return newBlock;
    } catch (err) {
      error.value = err.message;
      console.error('[addBlock]', err);
    }
  }

  async function editBlock(pageId, blockId, data) {
    try {
      const res = await api.updateBlock(pageId, blockId, data);
      const updated = res.data.data;
      const idx = currentBlocks.value.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        currentBlocks.value[idx] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err.message;
      console.error('[editBlock]', err);
    }
  }

  async function removeBlock(pageId, blockId) {
    try {
      await api.deleteBlock(pageId, blockId);
      currentBlocks.value = currentBlocks.value.filter((b) => b.id !== blockId);
    } catch (err) {
      error.value = err.message;
      console.error('[removeBlock]', err);
    }
  }

  async function reorderPageBlocks(pageId, orderedIds) {
    try {
      const res = await api.reorderBlocks(pageId, orderedIds);
      currentBlocks.value = res.data.data;
    } catch (err) {
      error.value = err.message;
      console.error('[reorderPageBlocks]', err);
    }
  }

  // Optimistic local update for block content (used with debounced save)
  function updateBlockLocal(blockId, data) {
    const idx = currentBlocks.value.findIndex((b) => b.id === blockId);
    if (idx !== -1) {
      currentBlocks.value[idx] = { ...currentBlocks.value[idx], ...data };
    }
  }

  return {
    // State
    pageTree,
    currentPage,
    currentBlocks,
    loading,
    error,
    // Getters
    flatPages,
    // Page actions
    fetchPages,
    fetchPage,
    addPage,
    renamePage,
    removePage,
    // Block actions
    addBlock,
    editBlock,
    removeBlock,
    reorderPageBlocks,
    updateBlockLocal,
  };
});