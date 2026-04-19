import apiClient from './axios.js'

export const userApi = {
  getUserByUsername(username) {
    return apiClient.get(`/api/users/${username}`)
  },

  getCurrentUser() {
    return apiClient.get('/api/users/me')
  },

  updateProfile(id, formData) {
    return apiClient.put(`/api/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  followUser(id) {
    return apiClient.post(`/api/users/${id}/follow`)
  },

  unfollowUser(id) {
    return apiClient.delete(`/api/users/${id}/follow`)
  },

  searchUsers(query) {
    return apiClient.get('/api/users/search', { params: { q: query } })
  }
}