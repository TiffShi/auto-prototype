import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Create a new trip
 * @param {{ pickup_lat: number, pickup_lng: number, dropoff_lat: number, dropoff_lng: number }} payload
 * @returns {Promise<TripResponse>}
 */
export async function createTrip(payload) {
  const response = await apiClient.post('/api/trips', payload);
  return response.data;
}

/**
 * List all trips
 * @returns {Promise<TripResponse[]>}
 */
export async function listTrips() {
  const response = await apiClient.get('/api/trips');
  return response.data;
}

/**
 * Get a single trip by ID
 * @param {string} tripId
 * @returns {Promise<TripResponse>}
 */
export async function getTrip(tripId) {
  const response = await apiClient.get(`/api/trips/${tripId}`);
  return response.data;
}