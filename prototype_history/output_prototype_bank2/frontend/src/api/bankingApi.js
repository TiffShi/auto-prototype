import axios from 'axios'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/account`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const getBalance = async () => {
  const response = await apiClient.get('/balance')
  return response.data
}

export const deposit = async (amount) => {
  const response = await apiClient.post('/deposit', { amount })
  return response.data
}

export const withdraw = async (amount) => {
  const response = await apiClient.post('/withdraw', { amount })
  return response.data
}

export const getTransactions = async () => {
  const response = await apiClient.get('/transactions')
  return response.data
}