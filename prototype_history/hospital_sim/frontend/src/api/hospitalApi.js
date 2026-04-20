import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const createHospital = (name) =>
  api.post('/api/hospitals', { name }).then((r) => r.data)

export const listHospitals = () =>
  api.get('/api/hospitals').then((r) => r.data)

export const getHospital = (id) =>
  api.get(`/api/hospitals/${id}`).then((r) => r.data)

export const setSimSpeed = (id, speed_multiplier, is_paused) =>
  api.patch(`/api/hospitals/${id}/speed`, { speed_multiplier, is_paused }).then((r) => r.data)

export const getDepartments = (id) =>
  api.get(`/api/hospitals/${id}/departments`).then((r) => r.data)

export const upgradeDepartment = (deptId) =>
  api.patch(`/api/departments/${deptId}/upgrade`).then((r) => r.data)

export const getFinancials = (id, limit = 50) =>
  api.get(`/api/hospitals/${id}/financials`, { params: { limit } }).then((r) => r.data)

export const getEvents = (id, limit = 50) =>
  api.get(`/api/hospitals/${id}/events`, { params: { limit } }).then((r) => r.data)

export const manualTick = (id) =>
  api.post(`/api/hospitals/${id}/simulate/tick`).then((r) => r.data)

export default api