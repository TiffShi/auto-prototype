import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/conflicts`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all conflicts with optional filters.
 * @param {Object} params - { resolved?: boolean, search?: string }
 */
export async function fetchConflicts(params = {}) {
  const response = await api.get('', { params });
  return response.data;
}

/**
 * Fetch summary statistics.
 */
export async function fetchStats() {
  const response = await api.get('/stats');
  return response.data;
}

/**
 * Create a new conflict entry.
 * @param {Object} payload - { primary_mod, conflicting_mod, crash_log_snippet, is_resolved }
 */
export async function createConflict(payload) {
  const response = await api.post('', payload);
  return response.data;
}

/**
 * Full update of a conflict entry.
 * @param {string} id - UUID
 * @param {Object} payload - { primary_mod, conflicting_mod, crash_log_snippet, is_resolved }
 */
export async function updateConflict(id, payload) {
  const response = await api.put(`/${id}`, payload);
  return response.data;
}

/**
 * Toggle the resolved status of a conflict.
 * @param {string} id - UUID
 * @param {boolean} isResolved
 */
export async function toggleResolve(id, isResolved) {
  const response = await api.patch(`/${id}/resolve`, { is_resolved: isResolved });
  return response.data;
}

/**
 * Delete a conflict entry.
 * @param {string} id - UUID
 */
export async function deleteConflict(id) {
  await api.delete(`/${id}`);
}