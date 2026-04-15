import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

/**
 * Fetch all videos with optional pagination
 */
export async function fetchVideos(skip = 0, limit = 50) {
  const response = await api.get('/api/videos', { params: { skip, limit } });
  return response.data;
}

/**
 * Fetch a single video's metadata by ID
 */
export async function fetchVideo(id) {
  const response = await api.get(`/api/videos/${id}`);
  return response.data;
}

/**
 * Upload a new video with title, description, and file
 * @param {FormData} formData - must contain title, description, file
 * @param {Function} onProgress - callback(percent: number)
 */
export async function uploadVideo(formData, onProgress) {
  const response = await api.post('/api/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress && onProgress(percent);
      }
    },
  });
  return response.data;
}

/**
 * Increment view count for a video
 */
export async function incrementView(id) {
  const response = await api.patch(`/api/videos/${id}/view`);
  return response.data;
}

/**
 * Delete a video by ID
 */
export async function deleteVideo(id) {
  const response = await api.delete(`/api/videos/${id}`);
  return response.data;
}

/**
 * Get the full streaming URL for a video
 */
export function getStreamUrl(id) {
  return `${BASE_URL}/api/videos/${id}/stream`;
}

/**
 * Get the full thumbnail URL for a video
 */
export function getThumbnailUrl(id) {
  return `${BASE_URL}/api/videos/${id}/thumbnail`;
}

export default api;