import apiClient from './axios.js'

export const postApi = {
  getFeed(page = 0, size = 10) {
    return apiClient.get('/api/posts/feed', { params: { page, size } })
  },

  getExplore(page = 0, size = 20) {
    return apiClient.get('/api/posts/explore', { params: { page, size } })
  },

  createPost(formData) {
    return apiClient.post('/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  getPost(id) {
    return apiClient.get(`/api/posts/${id}`)
  },

  deletePost(id) {
    return apiClient.delete(`/api/posts/${id}`)
  },

  likePost(id) {
    return apiClient.post(`/api/posts/${id}/like`)
  },

  unlikePost(id) {
    return apiClient.delete(`/api/posts/${id}/like`)
  },

  getUserPosts(username) {
    return apiClient.get(`/api/posts/user/${username}`)
  }
}