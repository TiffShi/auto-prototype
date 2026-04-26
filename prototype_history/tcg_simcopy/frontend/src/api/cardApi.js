import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function fetchCards(token) {
  const res = await axios.get(`${BASE_URL}/cards`, authHeaders(token));
  return res.data;
}

export async function fetchCard(token, cardId) {
  const res = await axios.get(`${BASE_URL}/cards/${cardId}`, authHeaders(token));
  return res.data;
}