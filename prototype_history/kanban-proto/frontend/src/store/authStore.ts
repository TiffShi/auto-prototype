import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { authApi } from '../api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const tokenData = await authApi.login({ email, password })
          localStorage.setItem('access_token', tokenData.access_token)
          set({ token: tokenData.access_token })
          const user = await authApi.me()
          set({ user, isLoading: false })
        } catch (err: unknown) {
          const message = extractErrorMessage(err)
          set({ error: message, isLoading: false })
          throw err
        }
      },

      register: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.register({ email, password })
          // Auto-login after registration
          const tokenData = await authApi.login({ email, password })
          localStorage.setItem('access_token', tokenData.access_token)
          set({ token: tokenData.access_token })
          const user = await authApi.me()
          set({ user, isLoading: false })
        } catch (err: unknown) {
          const message = extractErrorMessage(err)
          set({ error: message, isLoading: false })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null, error: null })
      },

      fetchMe: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) return
        set({ isLoading: true })
        try {
          const user = await authApi.me()
          set({ user, token, isLoading: false })
        } catch {
          localStorage.removeItem('access_token')
          set({ user: null, token: null, isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    },
  ),
)

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { detail?: string } } }).response
    return response?.data?.detail ?? 'An error occurred'
  }
  return 'An error occurred'
}