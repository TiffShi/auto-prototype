import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/authApi.js'
import router from '@/router/index.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  function setAuth(authData) {
    token.value = authData.token
    user.value = {
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      avatarUrl: authData.avatarUrl
    }
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function register(data) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.register(data)
      setAuth(response.data)
      router.push({ name: 'Home' })
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(data) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login(data)
      setAuth(response.data)
      const redirect = router.currentRoute.value.query.redirect
      router.push(redirect ? String(redirect) : { name: 'Home' })
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    clearAuth()
    router.push({ name: 'Login' })
  }

  function updateUserAvatar(avatarUrl) {
    if (user.value) {
      user.value = { ...user.value, avatarUrl }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    currentUser,
    register,
    login,
    logout,
    updateUserAvatar,
    setAuth
  }
})