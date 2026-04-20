import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 8000,
});

/**
 * Fetch top 10 scores from the leaderboard.
 * @returns {Promise<Array>} Array of score objects
 */
export async function fetchScores() {
  const response = await api.get('/scores');
  return response.data;
}

/**
 * Submit a new score to the leaderboard.
 * @param {string} name - Player name
 * @param {number} score - Final score
 * @param {number} level - Level reached
 * @returns {Promise<Object>} Created score object
 */
export async function submitScore(name, score, level) {
  const response = await api.post('/scores', { name, score, level });
  return response.data;
}

/**
 * Health check ping.
 * @returns {Promise<Object>}
 */
export async function healthCheck() {
  const response = await api.get('/health');
  return response.data;
}