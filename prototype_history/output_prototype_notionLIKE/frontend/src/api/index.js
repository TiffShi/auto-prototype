import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ── Pages ─────────────────────────────────────────────────────────────────────

export const getPages = () => apiClient.get('/api/pages');

export const getPage = (id) => apiClient.get(`/api/pages/${id}`);

export const createPage = (data) => apiClient.post('/api/pages', data);

export const updatePage = (id, data) => apiClient.put(`/api/pages/${id}`, data);

export const deletePage = (id) => apiClient.delete(`/api/pages/${id}`);

// ── Blocks ────────────────────────────────────────────────────────────────────

export const getBlocks = (pageId) => apiClient.get(`/api/pages/${pageId}/blocks`);

export const createBlock = (pageId, data) =>
  apiClient.post(`/api/pages/${pageId}/blocks`, data);

export const updateBlock = (pageId, blockId, data) =>
  apiClient.put(`/api/pages/${pageId}/blocks/${blockId}`, data);

export const deleteBlock = (pageId, blockId) =>
  apiClient.delete(`/api/pages/${pageId}/blocks/${blockId}`);

export const reorderBlocks = (pageId, orderedIds) =>
  apiClient.put(`/api/pages/${pageId}/blocks/reorder`, { orderedIds });

export default apiClient;