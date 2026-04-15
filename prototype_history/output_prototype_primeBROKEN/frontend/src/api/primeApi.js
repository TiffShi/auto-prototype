import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches prime numbers up to the given limit from the backend API.
 * @param {number} limit - The upper bound for prime computation.
 * @returns {Promise<{ limit: number, primes: number[] }>}
 * @throws {Error} with a user-friendly message on failure.
 */
export async function fetchPrimes(limit) {
  try {
    const response = await axios.get(`${BASE_URL}/api/primes`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to connect to the server. Please try again.');
  }
}