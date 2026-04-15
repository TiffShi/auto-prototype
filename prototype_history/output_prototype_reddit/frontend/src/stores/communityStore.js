import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/index.js'

export const useCommunityStore = defineStore('communities', () => {
  const communities = ref([])
  const currentCommunity = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCommunities() {
    loading.value = true
    error.value = null
    try {
      const res = await api.getCommunities()
      communities.value = res.data
    } catch (e) {
      error.value = e?.response?.data?.detail || 'Failed to load communities.'
    } finally {
      loading.value = false
    }
  }

  async function fetchCommunity(id) {
    loading.value = true
    error.value = null
    try {
      const res = await api.getCommunity(id)
      currentCommunity.value = res.data
    } catch (e) {
      error.value = e?.response?.data?.detail || 'Failed to load community.'
    } finally {
      loading.value = false
    }
  }

  async function addCommunity(payload) {
    const res = await api.createCommunity(payload)
    communities.value.unshift(res.data)
    return res.data
  }

  function getCommunityById(id) {
    return communities.value.find((c) => c.id === id) || null
  }

  return {
    communities,
    currentCommunity,
    loading,
    error,
    fetchCommunities,
    fetchCommunity,
    addCommunity,
    getCommunityById,
  }
})