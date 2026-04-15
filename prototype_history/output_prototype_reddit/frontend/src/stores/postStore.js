import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/index.js'

export const usePostStore = defineStore('posts', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchPosts(communityId = null) {
    loading.value = true
    error.value = null
    try {
      const res = await api.getPosts(communityId)
      posts.value = res.data
    } catch (e) {
      error.value = e?.response?.data?.detail || 'Failed to load posts.'
    } finally {
      loading.value = false
    }
  }

  async function fetchPost(id) {
    loading.value = true
    error.value = null
    try {
      const res = await api.getPost(id)
      currentPost.value = res.data
    } catch (e) {
      error.value = e?.response?.data?.detail || 'Failed to load post.'
    } finally {
      loading.value = false
    }
  }

  async function addPost(payload) {
    const res = await api.createPost(payload)
    posts.value.unshift(res.data)
    return res.data
  }

  async function removePost(id) {
    await api.deletePost(id)
    posts.value = posts.value.filter((p) => p.id !== id)
    if (currentPost.value?.id === id) currentPost.value = null
  }

  async function castVote(id, direction) {
    const res = await api.votePost(id, direction)
    const updated = res.data
    const idx = posts.value.findIndex((p) => p.id === id)
    if (idx !== -1) posts.value[idx] = updated
    if (currentPost.value?.id === id) currentPost.value = updated
    return updated
  }

  return {
    posts,
    currentPost,
    loading,
    error,
    fetchPosts,
    fetchPost,
    addPost,
    removePost,
    castVote,
  }
})