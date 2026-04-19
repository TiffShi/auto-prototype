import apiClient from './axios.js'

export const blocksApi = {
  getBlocks(pageId) {
    return apiClient.get(`/api/pages/${pageId}/blocks`)
  },

  createBlock(pageId, data) {
    return apiClient.post(`/api/pages/${pageId}/blocks`, data)
  },

  updateBlock(blockId, data) {
    return apiClient.put(`/api/blocks/${blockId}`, data)
  },

  deleteBlock(blockId) {
    return apiClient.delete(`/api/blocks/${blockId}`)
  },

  reorderBlocks(pageId, blocks) {
    return apiClient.put(`/api/pages/${pageId}/blocks/reorder`, { blocks })
  }
}