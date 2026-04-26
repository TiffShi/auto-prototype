import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function createGame(token, deckId) {
  const res = await axios.post(
    `${BASE_URL}/games/create`,
    { deck_id: deckId },
    authHeaders(token)
  );
  return res.data;
}

export async function joinGame(token, roomCode, deckId) {
  const res = await axios.post(
    `${BASE_URL}/games/join`,
    { room_code: roomCode, deck_id: deckId },
    authHeaders(token)
  );
  return res.data;
}

export async function getGame(token, roomCode) {
  const res = await axios.get(`${BASE_URL}/games/${roomCode}`, authHeaders(token));
  return res.data;
}