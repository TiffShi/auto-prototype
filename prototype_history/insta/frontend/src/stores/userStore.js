import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/userApi.js'

export const useUserStore = defineStore('user', () => {
  const profileUser = ref(null)
  const userPosts = ref([])
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchUserProfile(username) {
    loading.value = true
    error.value = null
    try {
      const response = await userApi.getUserByUsername(username)
      profileUser.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUserPosts(username) {
    loading.value = true
    try {
      const { postApi } = await import('@/api/postApi.js')
      const response = await postApi.getUserPosts(username)
      userPosts.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load posts'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(id, formData) {
    loading.value = true
    error.value = null
    try {
      const response = await userApi.updateProfile(id, formData)
      profileUser.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function followUser(id) {
    try {
      await userApi.followUser(id)
      if (profileUser.value?.id === id) {
        profileUser.value = {
          ...profileUser.value,
          isFollowing: true,
          followerCount: profileUser.value.followerCount + 1
        }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to follow user'
      throw err
    }
  }

  async function unfollowUser(id) {
    try {
      await userApi.unfollowUser(id)
      if (profileUser.value?.id === id) {
        profileUser.value = {
          ...profileUser.value,
          isFollowing: false,
          followerCount: Math.max(0, profileUser.value.followerCount - 1)
        }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to unfollow user'
      throw err
    }
  }

  async function searchUsers(query) {
    if (!query.trim()) {
      searchResults.value = []
      return
    }
    loading.value = true
    try {
      const response = await userApi.searchUsers(query)
      searchResults.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Search failed'
    } finally {
      loading.value = false
    }
  }

  function clearProfile() {
    profileUser.value = null
    userPosts.value = []
  }

  return {
    profileUser,
    userPosts,
    searchResults,
    loading,
    error,
    fetchUserProfile,
    fetchUserPosts,
    updateProfile,
    followUser,
    unfollowUser,
    searchUsers,
    clearProfile
  }
})