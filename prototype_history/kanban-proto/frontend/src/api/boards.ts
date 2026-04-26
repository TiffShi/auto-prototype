import apiClient from './axios'
import type { Board } from '../types'

export interface CreateBoardPayload {
  title: string
  description?: string | null
}

export interface UpdateBoardPayload {
  title?: string
  description?: string | null
}

export const boardsApi = {
  list: async (): Promise<Board[]> => {
    const { data } = await apiClient.get<Board[]>('/api/boards')
    return data
  },

  get: async (boardId: string): Promise<Board> => {
    const { data } = await apiClient.get<Board>(`/api/boards/${boardId}`)
    return data
  },

  create: async (payload: CreateBoardPayload): Promise<Board> => {
    const { data } = await apiClient.post<Board>('/api/boards', payload)
    return data
  },

  update: async (boardId: string, payload: UpdateBoardPayload): Promise<Board> => {
    const { data } = await apiClient.put<Board>(`/api/boards/${boardId}`, payload)
    return data
  },

  delete: async (boardId: string): Promise<void> => {
    await apiClient.delete(`/api/boards/${boardId}`)
  },
}