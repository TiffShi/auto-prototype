import axiosClient from './axiosClient.js';

/** List all items, optionally filtered by category */
export async function getItems(categoryId = null) {
  const params = categoryId ? { category_id: categoryId } : {};
  const response = await axiosClient.get('/items', { params });
  return response.data;
}

/** Get a single item by ID */
export async function getItem(id) {
  const response = await axiosClient.get(`/items/${id}`);
  return response.data;
}

/** Create a new menu item */
export async function createItem(data) {
  const response = await axiosClient.post('/items', data);
  return response.data;
}

/** Update an existing menu item */
export async function updateItem(id, data) {
  const response = await axiosClient.put(`/items/${id}`, data);
  return response.data;
}

/** Delete a menu item */
export async function deleteItem(id) {
  await axiosClient.delete(`/items/${id}`);
}

/** Upload an image for a menu item */
export async function uploadItemImage(id, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post(`/items/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/** Bulk reorder items */
export async function reorderItems(items) {
  const response = await axiosClient.post('/items/reorder', items);
  return response.data;
}