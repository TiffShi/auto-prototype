import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const getInventory = (hospitalId) =>
  api.get(`/api/hospitals/${hospitalId}/inventory`).then((r) => r.data)

export const purchaseInventory = (hospitalId, data) =>
  api.post(`/api/hospitals/${hospitalId}/inventory/purchase`, data).then((r) => r.data)