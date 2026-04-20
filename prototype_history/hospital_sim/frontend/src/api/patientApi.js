import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const getPatients = (hospitalId, status = null) => {
  const params = status ? { status } : {}
  return api.get(`/api/hospitals/${hospitalId}/patients`, { params }).then((r) => r.data)
}

export const admitPatient = (hospitalId, data) =>
  api.post(`/api/hospitals/${hospitalId}/patients/admit`, data).then((r) => r.data)

export const generatePatient = (hospitalId) =>
  api.post(`/api/hospitals/${hospitalId}/patients/generate`).then((r) => r.data)

export const updatePatientStatus = (patientId, status, department_id = null) =>
  api
    .patch(`/api/patients/${patientId}/status`, { status, department_id })
    .then((r) => r.data)