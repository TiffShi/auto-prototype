import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me')
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
export const menuApi = {
  getCategories: () => api.get('/api/categories'),
  getDrinks: (params) => api.get('/api/drinks', { params }),
  getDrink: (id) => api.get(`/api/drinks/${id}`),
  getModifiers: (params) => api.get('/api/modifiers', { params })
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  placeOrder: (data) => api.post('/api/orders', data),
  getOrders: () => api.get('/api/orders'),
  getOrder: (id) => api.get(`/api/orders/${id}`)
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  createDrink: (data) => api.post('/api/admin/drinks', data),
  updateDrink: (id, data) => api.put(`/api/admin/drinks/${id}`, data),
  deleteDrink: (id) => api.delete(`/api/admin/drinks/${id}`),
  uploadImage: (id, formData) =>
    api.post(`/api/admin/drinks/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getCategories: () => api.get('/api/admin/categories'),
  createCategory: (data) => api.post('/api/admin/categories', data),
  getModifiers: () => api.get('/api/modifiers'),
  createModifier: (data) => api.post('/api/admin/modifiers', data),
  deleteModifier: (id) => api.delete(`/api/admin/modifiers/${id}`),
  getAllOrders: () => api.get('/api/admin/orders'),
  updateOrderStatus: (id, status) =>
    api.patch(`/api/orders/${id}/status`, { status })
}

// ─── Media ────────────────────────────────────────────────────────────────────
export const getMediaUrl = (objectPath) => {
  if (!objectPath) return null
  if (objectPath.startsWith('http')) return objectPath
  return `${API_URL}/api/media/${objectPath}`
}