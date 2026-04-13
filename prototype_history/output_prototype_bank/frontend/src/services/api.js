import axios from 'axios'

/**
 * Axios instance configured to communicate with
 * the Spring Boot backend at /api (proxied to localhost:8080).
 */
const apiClient = axios.create({
  baseURL: '/api/account',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.'
    return Promise.reject({ message, data: error.response?.data })
  }
)

/**
 * Fetch the current account balance.
 * @returns {Promise<{ balance: number }>}
 */
export const getBalance = async () => {
  const response = await apiClient.get('/balance')
  return response.data
}

/**
 * Deposit cash into the account.
 * @param {number} amount
 * @returns {Promise<{ balance: number, message: string }>}
 */
export const deposit = async (amount) => {
  const response = await apiClient.post('/deposit', { amount })
  return response.data
}

/**
 * Withdraw cash from the account.
 * @param {number} amount
 * @returns {Promise<{ balance: number, message: string }>}
 */
export const withdraw = async (amount) => {
  const response = await apiClient.post('/withdraw', { amount })
  return response.data
}

/**
 * Fetch the full transaction history.
 * @returns {Promise<Array<{ type: string, amount: number, timestamp: string, balanceAfter: number }>>}
 */
export const getTransactions = async () => {
  const response = await apiClient.get('/transactions')
  return response.data
}