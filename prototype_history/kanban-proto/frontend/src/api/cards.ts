import apiClient from './axios'
import type { Card, Priority } from '../types'

export interface CreateCardPayload {
  title: string
  description?: string | null
  due_date?: string | null
  priority?: Priority
  order?: number
}

export interface UpdateCardPayload {
  title?: string
  description?: string | null
  due_date?: string | null
  priority?: Priority
  order?: number
}

export interface MoveCardPayload {
  column_id: string
  order: number
}

export const cardsApi = {
  list: async (columnId: string): Promise<Card[]> => {
    const { data } = await apiClient.get<Card[]>(`/api/columns/${columnId}/cards`)
    return data
  },

  get: async (cardId: string): Promise<Card> => {
    const { data } = await apiClient.get<Card>(`/api/cards/${cardId}`)
    return data
  },

  create: async (columnId: string, payload: CreateCardPayload): Promise<Card> => {
    const { data } = await apiClient.post<Card>(`/api/columns/${columnId}/cards`, payload)
    return data
  },

  update: async (cardId: string, payload: UpdateCardPayload): Promise<Card> => {
    const { data } = await apiClient.put<Card>(`/api/cards/${cardId}`, payload)
    return data
  },

  move: async (cardId: string, payload: MoveCardPayload): Promise<Card> => {
    const { data } = await apiClient.patch<Card>(`/api/cards/${cardId}/move`, payload)
    return data
  },

  delete: async (cardId: string): Promise<void> => {
    await apiClient.delete(`/api/cards/${cardId}`)
  },
}