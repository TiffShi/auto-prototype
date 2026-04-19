import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Tracks
export const getTracks = () => client.get('/api/tracks')
export const getTrack = (id) => client.get(`/api/tracks/${id}`)

// Albums
export const getAlbums = () => client.get('/api/albums')
export const getAlbum = (id) => client.get(`/api/albums/${id}`)

// Artists
export const getArtists = () => client.get('/api/artists')
export const getArtist = (id) => client.get(`/api/artists/${id}`)

// Playlists
export const getPlaylists = () => client.get('/api/playlists')
export const createPlaylist = (data) => client.post('/api/playlists', data)
export const updatePlaylist = (id, data) => client.put(`/api/playlists/${id}`, data)
export const deletePlaylist = (id) => client.delete(`/api/playlists/${id}`)
export const addTrackToPlaylist = (playlistId, trackId) =>
  client.post(`/api/playlists/${playlistId}/tracks`, { track_id: trackId })
export const removeTrackFromPlaylist = (playlistId, trackId) =>
  client.delete(`/api/playlists/${playlistId}/tracks/${trackId}`)

// Search
export const searchMusic = (q) => client.get('/api/search', { params: { q } })

// Featured
export const getFeatured = () => client.get('/api/featured')
export const getCategories = () => client.get('/api/categories')

export default client