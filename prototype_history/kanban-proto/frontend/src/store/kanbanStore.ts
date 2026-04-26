import { create } from 'zustand'
import type { Column, Card } from '../types'
import { columnsApi } from '../api/columns'
import { cardsApi } from '../api/cards'

interface KanbanState {
  columns: Column[]
  cards: Record<string, Card[]> // columnId -> cards
  isLoading: boolean
  error: string | null

  // Board data loading
  loadBoard: (boardId: string) => Promise<void>
  reset: () => void

  // Column operations
  createColumn: (boardId: string, title: string) => Promise<void>
  updateColumn: (columnId: string, title: string) => Promise<void>
  deleteColumn: (columnId: string) => Promise<void>
  reorderColumns: (columns: Column[]) => Promise<void>

  // Card operations
  createCard: (columnId: string, title: string) => Promise<void>
  updateCard: (cardId: string, columnId: string, data: Partial<Card>) => Promise<void>
  deleteCard: (cardId: string, columnId: string) => Promise<void>
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, newOrder: number) => Promise<void>
  reorderCardsInColumn: (columnId: string, cards: Card[]) => Promise<void>

  clearError: () => void
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: [],
  cards: {},
  isLoading: false,
  error: null,

  loadBoard: async (boardId) => {
    set({ isLoading: true, error: null, columns: [], cards: {} })
    try {
      const columns = await columnsApi.list(boardId)
      const cardsMap: Record<string, Card[]> = {}
      await Promise.all(
        columns.map(async (col) => {
          const cards = await cardsApi.list(col.id)
          cardsMap[col.id] = cards
        }),
      )
      set({ columns, cards: cardsMap, isLoading: false })
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err), isLoading: false })
    }
  },

  reset: () => set({ columns: [], cards: {}, isLoading: false, error: null }),

  createColumn: async (boardId, title) => {
    try {
      const column = await columnsApi.create(boardId, { title })
      set((state) => ({
        columns: [...state.columns, column],
        cards: { ...state.cards, [column.id]: [] },
      }))
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
      throw err
    }
  },

  updateColumn: async (columnId, title) => {
    try {
      const updated = await columnsApi.update(columnId, { title })
      set((state) => ({
        columns: state.columns.map((c) => (c.id === columnId ? updated : c)),
      }))
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
      throw err
    }
  },

  deleteColumn: async (columnId) => {
    try {
      await columnsApi.delete(columnId)
      set((state) => {
        const newCards = { ...state.cards }
        delete newCards[columnId]
        return {
          columns: state.columns.filter((c) => c.id !== columnId),
          cards: newCards,
        }
      })
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
      throw err
    }
  },

  reorderColumns: async (newColumns) => {
    // Optimistic update
    set({ columns: newColumns })
    try {
      await Promise.all(
        newColumns.map((col, idx) =>
          columnsApi.reorder(col.id, { order: idx * 1000 }),
        ),
      )
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
    }
  },

  createCard: async (columnId, title) => {
    try {
      const card = await cardsApi.create(columnId, { title })
      set((state) => ({
        cards: {
          ...state.cards,
          [columnId]: [...(state.cards[columnId] ?? []), card],
        },
      }))
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
      throw err
    }
  },

  updateCard: async (cardId, columnId, data) => {
    try {
      const updated = await cardsApi.update(cardId, data)
      set((state) => ({
        cards: {
          ...state.cards,
          [columnId]: (state.cards[columnId] ?? []).map((c) =>
            c.id === cardId ? updated : c,
          ),
        },
      }))
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
      throw err
    }
  },

  deleteCard: async (cardId, columnId) => {
    try {
      await cardsApi.delete(cardId)
      set((state) => ({
        cards: {
          ...state.cards,
          [columnId]: (state.cards[columnId] ?? []).filter((c) => c.id !== cardId),
        },
      }))
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
      throw err
    }
  },

  moveCard: async (cardId, fromColumnId, toColumnId, newOrder) => {
    const state = get()
    const card = (state.cards[fromColumnId] ?? []).find((c) => c.id === cardId)
    if (!card) return

    // Optimistic update
    const updatedCard = { ...card, column_id: toColumnId, order: newOrder }
    set((s) => {
      const fromCards = (s.cards[fromColumnId] ?? []).filter((c) => c.id !== cardId)
      const toCards = [...(s.cards[toColumnId] ?? []), updatedCard].sort(
        (a, b) => a.order - b.order,
      )
      return {
        cards: {
          ...s.cards,
          [fromColumnId]: fromCards,
          [toColumnId]: toCards,
        },
      }
    })

    try {
      await cardsApi.move(cardId, { column_id: toColumnId, order: newOrder })
    } catch (err: unknown) {
      // Revert on failure
      set((s) => {
        const toCards = (s.cards[toColumnId] ?? []).filter((c) => c.id !== cardId)
        const fromCards = [...(s.cards[fromColumnId] ?? []), card].sort(
          (a, b) => a.order - b.order,
        )
        return {
          cards: {
            ...s.cards,
            [fromColumnId]: fromCards,
            [toColumnId]: toCards,
          },
          error: extractErrorMessage(err),
        }
      })
    }
  },

  reorderCardsInColumn: async (columnId, newCards) => {
    // Optimistic update
    set((state) => ({
      cards: { ...state.cards, [columnId]: newCards },
    }))
    try {
      await Promise.all(
        newCards.map((card, idx) =>
          cardsApi.update(card.id, { order: idx * 1000 }),
        ),
      )
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err) })
    }
  },

  clearError: () => set({ error: null }),
}))

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { detail?: string } } }).response
    return response?.data?.detail ?? 'An error occurred'
  }
  return 'An error occurred'
}