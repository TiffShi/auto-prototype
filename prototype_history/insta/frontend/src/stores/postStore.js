import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postApi } from '@/api/postApi.js'

export const usePostStore = defineStore('post', () => {
  const feedPosts = ref([])
  const explorePosts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const feedPage = ref(0)
  const explorePage = ref(0)
  const hasMoreFeed = ref(true)
  const hasMoreExplore = ref(true)

  async function fetchFeed(reset = false) {
    if (reset) {
      feedPage.value = 0
      feedPosts.value = []
      hasMoreFeed.value = true
    }
    if (!hasMoreFeed.value) return
    loading.value = true
    error.value = null
    try {
      const response = await postApi.getFeed(feedPage.value, 10)
      const newPosts = response.data
      if (newPosts.length < 10) hasMoreFeed.value = false
      feedPosts.value = reset ? newPosts : [...feedPosts.value, ...newPosts]
      feedPage.value++
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load feed'
    } finally {
      loading.value = false
    }
  }

  async function fetchExplore(reset = false) {
    if (reset) {
      explorePage.value = 0
      explorePosts.value = []
      hasMoreExplore.value = true
    }
    if (!hasMoreExplore.value) return
    loading.value = true
    error.value = null
    try {
      const response = await postApi.getExplore(explorePage.value, 20)
      const newPosts = response.data
      if (newPosts.length < 20) hasMoreExplore.value = false
      explorePosts.value = reset ? newPosts : [...explorePosts.value, ...newPosts]
      explorePage.value++
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load explore'
    } finally {
      loading.value = false
    }
  }

  async function fetchPost(id) {
    loading.value = true
    error.value = null
    try {
      const response = await postApi.getPost(id)
      currentPost.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load post'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPost(formData) {
    loading.value = true
    error.value = null
    try {
      const response = await postApi.createPost(formData)
      feedPosts.value = [response.data, ...feedPosts.value]
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create post'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePost(id) {
    try {
      await postApi.deletePost(id)
      feedPosts.value = feedPosts.value.filter(p => p.id !== id)
      explorePosts.value = explorePosts.value.filter(p => p.id !== id)
      if (currentPost.value?.id === id) currentPost.value = null
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete post'
      throw err
    }
  }

  async function toggleLike(post) {
    try {
      let response
      if (post.likedByCurrentUser) {
        response = await postApi.unlikePost(post.id)
      } else {
        response = await postApi.likePost(post.id)
      }
      const updatedPost = response.data
      updatePostInLists(updatedPost)
      return updatedPost
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to toggle like'
      throw err
    }
  }

  function updatePostInLists(updatedPost) {
    const feedIdx = feedPosts.value.findIndex(p => p.id === updatedPost.id)
    if (feedIdx !== -1) feedPosts.value[feedIdx] = updatedPost

    const exploreIdx = explorePosts.value.findIndex(p => p.id === updatedPost.id)
    if (exploreIdx !== -1) explorePosts.value[exploreIdx] = updatedPost

    if (currentPost.value?.id === updatedPost.id) currentPost.value = updatedPost
  }

  return {
    feedPosts,
    explorePosts,
    currentPost,
    loading,
    error,
    hasMoreFeed,
    hasMoreExplore,
    fetchFeed,
    fetchExplore,
    fetchPost,
    createPost,
    deletePost,
    toggleLike,
    updatePostInLists
  }
})