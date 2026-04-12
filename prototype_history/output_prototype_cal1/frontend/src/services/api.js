import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Send a math expression to the backend for evaluation.
 * POST /api/calculate
 *
 * @param {string} expression - The math expression string (e.g. "8 * (3 + 2)")
 * @returns {Promise<{ result: number, expression: string }>}
 */
export async function calculateExpression(expression) {
  try {
    const response = await apiClient.post('/calculate', { expression });
    return { data: response.data, error: null };
  } catch (err) {
    if (err.response) {
      // Backend returned a structured error (400, 422, 500)
      const detail = err.response.data?.detail;
      if (detail && typeof detail === 'object' && detail.error) {
        return { data: null, error: detail.error };
      }
      if (detail && typeof detail === 'string') {
        return { data: null, error: detail };
      }
      if (err.response.data?.detail?.[0]?.msg) {
        return { data: null, error: err.response.data.detail[0].msg };
      }
      return { data: null, error: 'Invalid expression' };
    }
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return { data: null, error: 'Request timed out. Is the server running?' };
    }
    return { data: null, error: 'Network error. Could not reach the server.' };
  }
}

export default apiClient;