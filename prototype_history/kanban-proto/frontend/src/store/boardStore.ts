import { create } from 'zustand'
import type { Board } from '../types'
import { boardsApi } from '../api/boards'

interface BoardState {
  boards: Board[]
  selectedBoardId: string | null
  isLoading: boolean
  error: string | null
  fetchBoards: () => Promise<void>
  createBoard: (title: string, description?: string) => Promise<Board>
  updateBoard: (boardId: string, title: string, description?: string) => Promise<void>
  deleteBoard: (boardId: string) => Promise<void>
  selectBoard: (boardId: string | null) => void
  clearError: () => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  selectedBoardId: null,
  isLoading: false,
  error: null,

  fetchBoards: async () => {
    set({ isLoading: true, error: null })
    try {
      const boards = await boardsApi.list()
      set({ boards, isLoading: false })
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err), isLoading: false })
    }
  },

  createBoard: async (title, description) => {
    set({ isLoading: true, error: null })
    try {
      const board = await boardsApi.create({ title, description: description ?? null })
      set((state) => ({ boards: [...state.boards, board], isLoading: false }))
      return board
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err), isLoading: false })
      throw err
    }
  },

  updateBoard: async (boardId, title, description) => {
    try {
      const updated = await boardsApi.update(boardId, { title, description: description ?? null })
      set((state) => ({
        boards: state.boards.map((b) => (b.id === boardId ? updated : b)),
      }))
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
      throw err
    }
  },

  deleteBoard: async (boardId) => {
    try {
      await boardsApi.delete(boardId)
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId),
        selectedBoardId:
          state.selectedBoardId === boardId ? null : state.selectedBoardId,
      }))
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
      throw err
    }
  },

  selectBoard: (boardId) => set({ selectedBoardId: boardId }),

  clearError: () => set({ error: null }),
}))

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { detail?: string } } }).response
    return response?.data?.detail ?? 'An error occurred'
  }
  return 'An error occurred'
}