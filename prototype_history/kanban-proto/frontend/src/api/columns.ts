import apiClient from './axios'
import type { Column } from '../types'

export interface CreateColumnPayload {
  title: string
  order?: number
}

export interface UpdateColumnPayload {
  title?: string
  order?: number
}

export interface ReorderColumnPayload {
  order: number
}

export const columnsApi = {
  list: async (boardId: string): Promise<Column[]> => {
    const { data } = await apiClient.get<Column[]>(`/api/boards/${boardId}/columns`)
    return data
  },

  create: async (boardId: string, payload: CreateColumnPayload): Promise<Column> => {
    const { data } = await apiClient.post<Column>(`/api/boards/${boardId}/columns`, payload)
    return data
  },

  update: async (columnId: string, payload: UpdateColumnPayload): Promise<Column> => {
    const { data } = await apiClient.put<Column>(`/api/columns/${columnId}`, payload)
    return data
  },

  reorder: async (columnId: string, payload: ReorderColumnPayload): Promise<Column> => {
    const { data } = await apiClient.patch<Column>(`/api/columns/${columnId}/reorder`, payload)
    return data
  },

  delete: async (columnId: string): Promise<void> => {
    await apiClient.delete(`/api/columns/${columnId}`)
  },
}