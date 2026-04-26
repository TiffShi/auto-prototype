import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export async function register(username, password) {
  const res = await axios.post(`${BASE_URL}/auth/register`, { username, password });
  return res.data;
}

export async function login(username, password) {
  const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
  return res.data;
}