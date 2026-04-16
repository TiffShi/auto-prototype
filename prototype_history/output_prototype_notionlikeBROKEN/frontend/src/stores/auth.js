import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth.js'
import router from '@/router/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function initAuth() {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
        // Verify token is still valid
        const response = await authApi.me()
        user.value = response.data
        localStorage.setItem('auth_user', JSON.stringify(response.data))
      } catch {
        clearAuth()
      }
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login(credentials)
      const data = response.data
      token.value = data.token
      user.value = data
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data))
      router.push({ name: 'Home' })
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.register(userData)
      const data = response.data
      token.value = data.token
      user.value = data
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data))
      router.push({ name: 'Home' })
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      clearAuth()
      router.push({ name: 'Login' })
    }
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
    clearAuth
  }
})