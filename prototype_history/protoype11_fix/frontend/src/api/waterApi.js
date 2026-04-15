import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ---------------------------------------------------------------------------
// Request / Response interceptors
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ---------------------------------------------------------------------------
// Water Entries
// ---------------------------------------------------------------------------

/**
 * POST /api/entries
 * @param {{ amount: number, unit: string, logged_at?: string }} payload
 */
export const logEntry = (payload) =>
  api.post('/api/entries/', payload).then((r) => r.data);

/**
 * GET /api/entries/today
 */
export const getTodayEntries = () =>
  api.get('/api/entries/today').then((r) => r.data);

/**
 * GET /api/entries?date=YYYY-MM-DD
 * @param {string} [date]
 */
export const getEntriesByDate = (date) =>
  api.get('/api/entries/', { params: date ? { date } : {} }).then((r) => r.data);

/**
 * DELETE /api/entries/{id}
 * @param {number} id
 */
export const deleteEntry = (id) =>
  api.delete(`/api/entries/${id}`).then((r) => r.data);

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/**
 * GET /api/settings
 */
export const getSettings = () =>
  api.get('/api/settings/').then((r) => r.data);

/**
 * PUT /api/settings
 * @param {{ daily_goal_ml?: number, reminder_interval_min?: number, preferred_unit?: string }} payload
 */
export const updateSettings = (payload) =>
  api.put('/api/settings/', payload).then((r) => r.data);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/**
 * GET /api/summary/today
 */
export const getTodaySummary = () =>
  api.get('/api/summary/today').then((r) => r.data);

/**
 * GET /api/summary/history
 */
export const getHistorySummary = () =>
  api.get('/api/summary/history').then((r) => r.data);

export default api;