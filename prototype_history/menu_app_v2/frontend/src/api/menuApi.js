import axiosClient from './axiosClient.js';

/** Get all published menus (public) */
export async function getPublicMenus() {
  const response = await axiosClient.get('/menu');
  return response.data;
}

/** Get the published menu for a specific owner */
export async function getOwnerPublicMenu(ownerId) {
  const response = await axiosClient.get(`/menu/${ownerId}`);
  return response.data;
}