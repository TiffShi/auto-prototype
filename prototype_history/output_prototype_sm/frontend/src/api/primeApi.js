import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches all prime numbers up to and including `limit` from the backend.
 * @param {number|string} limit - The upper bound for the sieve.
 * @returns {Promise<{limit: number, primes: number[], count: number}>}
 */
export async function fetchPrimes(limit) {
  const response = await axios.get(`${API_BASE_URL}/api/primes`, {
    params: { limit },
  });
  return response.data;
}