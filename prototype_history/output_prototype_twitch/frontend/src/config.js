// Dynamically resolve the backend host so the app works on any machine
// on the local network — viewers just navigate to http://[broadcaster-ip]:5173
const backendHost = window.location.hostname;
const API_PORT = 8080;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `http://${backendHost}:${API_PORT}`;

export const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ||
  `ws://${backendHost}:${API_PORT}`;

export const ENDPOINTS = {
  streams: `${API_BASE_URL}/streams`,
  health: `${API_BASE_URL}/health`,
  wsBroadcast: (streamId) => `${WS_BASE_URL}/ws/broadcast/${streamId}`,
  wsWatch: (streamId) => `${WS_BASE_URL}/ws/watch/${streamId}`,
  hlsPlaylist: (streamId) => `${API_BASE_URL}/hls/${streamId}/playlist.m3u8`,
};