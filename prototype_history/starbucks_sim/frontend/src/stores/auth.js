import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('access_token') || null)
  const user = ref(
    localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user'))
      : null
  )
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')

  function setAuth(accessToken, userData) {
    token.value = accessToken
    user.value = userData
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  async function register(name, email, password) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.register({ name, email, password })
      setAuth(res.data.access_token, res.data.user)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.detail || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.login({ email, password })
      setAuth(res.data.access_token, res.data.user)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authApi.me()
      user.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch {
      clearAuth()
    }
  }

  function logout() {
    clearAuth()
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    userName,
    register,
    login,
    logout,
    fetchMe
  }
})