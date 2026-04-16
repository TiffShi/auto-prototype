import { defineStore } from 'pinia'
import { ref } from 'vue'
import { blocksApi } from '@/api/blocks.js'

export const useEditorStore = defineStore('editor', () => {
  const blocks = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const currentPageId = ref(null)

  async function fetchBlocks(pageId) {
    loading.value = true
    error.value = null
    currentPageId.value = pageId
    try {
      const response = await blocksApi.getBlocks(pageId)
      blocks.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch blocks'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createBlock(pageId, data) {
    try {
      const response = await blocksApi.createBlock(pageId, data)
      const newBlock = response.data
      blocks.value.push(newBlock)
      blocks.value.sort((a, b) => a.orderIndex - b.orderIndex)
      return newBlock
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create block'
      throw err
    }
  }

  async function updateBlock(blockId, data) {
    saving.value = true
    try {
      const response = await blocksApi.updateBlock(blockId, data)
      const updated = response.data
      const index = blocks.value.findIndex(b => b.id === blockId)
      if (index !== -1) {
        blocks.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update block'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteBlock(blockId) {
    try {
      await blocksApi.deleteBlock(blockId)
      blocks.value = blocks.value.filter(b => b.id !== blockId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete block'
      throw err
    }
  }

  async function reorderBlocks(pageId, reorderedBlocks) {
    try {
      const orderData = reorderedBlocks.map((block, index) => ({
        id: block.id,
        orderIndex: index
      }))
      const response = await blocksApi.reorderBlocks(pageId, orderData)
      blocks.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reorder blocks'
      throw err
    }
  }

  function clearBlocks() {
    blocks.value = []
    currentPageId.value = null
  }

  return {
    blocks,
    loading,
    saving,
    error,
    currentPageId,
    fetchBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    clearBlocks
  }
})