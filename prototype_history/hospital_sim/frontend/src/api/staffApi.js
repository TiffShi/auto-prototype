import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const getStaff = (hospitalId) =>
  api.get(`/api/hospitals/${hospitalId}/staff`).then((r) => r.data)

export const hireStaff = (hospitalId, data) =>
  api.post(`/api/hospitals/${hospitalId}/staff/hire`, data).then((r) => r.data)

export const fireStaff = (staffId) =>
  api.delete(`/api/staff/${staffId}`).then((r) => r.data)

export const assignStaff = (staffId, department_id) =>
  api.patch(`/api/staff/${staffId}/assign`, { department_id }).then((r) => r.data)