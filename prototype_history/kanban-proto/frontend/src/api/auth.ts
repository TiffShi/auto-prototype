import apiClient from './axios'
import type { User, Token } from '../types'

export interface RegisterPayload {
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/api/auth/register', payload)
    return data
  },

  login: async (payload: LoginPayload): Promise<Token> => {
    const { data } = await apiClient.post<Token>('/api/auth/login', payload)
    return data
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/auth/me')
    return data
  },
}