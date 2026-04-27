import axiosClient from './axiosClient.js';

/** List all categories for the authenticated owner */
export async function getCategories() {
  const response = await axiosClient.get('/categories');
  return response.data;
}

/** Get a single category by ID */
export async function getCategory(id) {
  const response = await axiosClient.get(`/categories/${id}`);
  return response.data;
}

/** Create a new category */
export async function createCategory(data) {
  const response = await axiosClient.post('/categories', data);
  return response.data;
}

/** Update an existing category */
export async function updateCategory(id, data) {
  const response = await axiosClient.put(`/categories/${id}`, data);
  return response.data;
}

/** Delete a category */
export async function deleteCategory(id) {
  await axiosClient.delete(`/categories/${id}`);
}

/** Bulk reorder categories */
export async function reorderCategories(items) {
  const response = await axiosClient.post('/categories/reorder', items);
  return response.data;
}