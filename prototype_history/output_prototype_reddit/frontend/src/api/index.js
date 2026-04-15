import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Communities ──────────────────────────────────────────────────────────────
export const getCommunities = () => api.get('/communities')
export const getCommunity = (id) => api.get(`/communities/${id}`)
export const createCommunity = (payload) => api.post('/communities', payload)

// ── Posts ────────────────────────────────────────────────────────────────────
export const getPosts = (communityId = null) =>
  api.get('/posts', { params: communityId ? { community_id: communityId } : {} })
export const getPost = (id) => api.get(`/posts/${id}`)
export const createPost = (payload) => api.post('/posts', payload)
export const deletePost = (id) => api.delete(`/posts/${id}`)
export const votePost = (id, direction) =>
  api.post(`/posts/${id}/vote`, { direction })

// ── Comments ─────────────────────────────────────────────────────────────────
export const getComments = (postId) => api.get(`/posts/${postId}/comments`)
export const createComment = (postId, payload) =>
  api.post(`/posts/${postId}/comments`, payload)
export const deleteComment = (id) => api.delete(`/comments/${id}`)
export const voteComment = (id, direction) =>
  api.post(`/comments/${id}/vote`, { direction })

export default api