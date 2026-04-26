export interface User {
  id: string
  email: string
  created_at: string
}

export interface Board {
  id: string
  owner_id: string
  title: string
  description: string | null
  created_at: string
}

export interface Column {
  id: string
  board_id: string
  title: string
  order: number
  created_at: string
}

export type Priority = 'low' | 'medium' | 'high'

export interface Card {
  id: string
  column_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: Priority
  order: number
  created_at: string
  updated_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface ApiError {
  detail: string
}