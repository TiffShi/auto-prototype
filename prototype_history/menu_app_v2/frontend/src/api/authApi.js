import axiosClient from './axiosClient.js';

/**
 * Register a new restaurant owner.
 * @param {{ email: string, password: string, restaurant_name: string }} data
 */
export async function registerOwner(data) {
  const response = await axiosClient.post('/auth/register', data);
  return response.data;
}

/**
 * Login with email and password.
 * @param {{ email: string, password: string }} data
 */
export async function loginOwner(data) {
  const response = await axiosClient.post('/auth/login', data);
  return response.data;
}