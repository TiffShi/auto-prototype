import apiClient from './axios.js'

export const authApi = {
  register(data) {
    return apiClient.post('/api/auth/register', data)
  },

  login(data) {
    return apiClient.post('/api/auth/login', data)
  }
}