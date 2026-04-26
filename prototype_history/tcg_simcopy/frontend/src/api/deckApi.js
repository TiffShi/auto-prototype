import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function fetchDecks(token) {
  const res = await axios.get(`${BASE_URL}/decks`, authHeaders(token));
  return res.data;
}

export async function fetchDeck(token, deckId) {
  const res = await axios.get(`${BASE_URL}/decks/${deckId}`, authHeaders(token));
  return res.data;
}

export async function createDeck(token, name, cards) {
  const res = await axios.post(`${BASE_URL}/decks`, { name, cards }, authHeaders(token));
  return res.data;
}

export async function updateDeck(token, deckId, name, cards) {
  const res = await axios.put(
    `${BASE_URL}/decks/${deckId}`,
    { name, cards },
    authHeaders(token)
  );
  return res.data;
}

export async function deleteDeck(token, deckId) {
  await axios.delete(`${BASE_URL}/decks/${deckId}`, authHeaders(token));
}