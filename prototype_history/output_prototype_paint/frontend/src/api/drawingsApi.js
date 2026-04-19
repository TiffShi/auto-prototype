import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('[drawingsApi] VITE_API_URL is not defined. Check your .env file.');
}

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 30000
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Unknown API error';
    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  }
);

/**
 * Save a drawing to the server.
 * @param {string} imageData - base64 PNG data URL
 * @param {string} [name] - optional drawing name
 * @returns {Promise<{ message: string, drawing: object }>}
 */
export async function saveDrawing(imageData, name) {
  return apiClient.post('/drawings', { imageData, name });
}

/**
 * Fetch all saved drawings metadata.
 * @returns {Promise<{ drawings: Array }>}
 */
export async function listDrawings() {
  return apiClient.get('/drawings');
}

/**
 * Fetch a specific drawing by ID.
 * @param {string} id
 * @returns {Promise<Blob>}
 */
export async function getDrawingById(id) {
  return apiClient.get(`/drawings/${id}`, { responseType: 'blob' });
}

/**
 * Delete a drawing by ID.
 * @param {string} id
 * @returns {Promise<{ message: string, id: string }>}
 */
export async function removeDrawing(id) {
  return apiClient.delete(`/drawings/${id}`);
}