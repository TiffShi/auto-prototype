import apiClient from './axios.js'

export const commentApi = {
  getComments(postId) {
    return apiClient.get(`/api/posts/${postId}/comments`)
  },

  addComment(postId, content) {
    return apiClient.post(`/api/posts/${postId}/comments`, { content })
  },

  deleteComment(commentId) {
    return apiClient.delete(`/api/comments/${commentId}`)
  }
}