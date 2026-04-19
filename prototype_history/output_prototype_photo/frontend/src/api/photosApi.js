import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

/**
 * Fetch all photos from the API.
 * @returns {Promise<{photos: Array, total: number}>}
 */
export async function fetchAllPhotos() {
  const response = await apiClient.get('/api/photos');
  return response.data;
}

/**
 * Fetch a single photo by ID.
 * @param {string} photoId
 * @returns {Promise<Object>}
 */
export async function fetchPhotoById(photoId) {
  const response = await apiClient.get(`/api/photos/${photoId}`);
  return response.data;
}

/**
 * Upload a new photo.
 * @param {File} file
 * @param {string} title
 * @param {string} description
 * @param {Function} onUploadProgress - optional progress callback
 * @returns {Promise<Object>}
 */
export async function uploadPhoto(file, title, description, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);

  const response = await apiClient.post('/api/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return response.data;
}

/**
 * Delete a photo by ID.
 * @param {string} photoId
 * @returns {Promise<Object>}
 */
export async function deletePhoto(photoId) {
  const response = await apiClient.delete(`/api/photos/${photoId}`);
  return response.data;
}

export default apiClient;