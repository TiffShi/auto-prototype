import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import type { Column, Card } from '../../types'
import { useKanbanStore } from '../../store/kanbanStore'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import AddColumnBtn from './AddColumnBtn'

interface KanbanBoardProps {
  boardId: string
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const { columns, cards, reorderColumns, moveCard, reorderCardsInColumn } = useKanbanStore()
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current
    if (data?.type === 'card') {
      setActiveCard(data.card as Card)
    } else if (data?.type === 'column') {
      setActiveColumn(data.column as Column)
    }
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeData = active.data.current
      const overData = over.data.current

      if (activeData?.type !== 'card') return

      const activeCard = activeData.card as Card
      const activeColumnId = activeCard.column_id

      // Determine target column
      let targetColumnId: string
      if (overData?.type === 'card') {
        targetColumnId = (overData.card as Card).column_id
      } else if (overData?.type === 'column') {
        targetColumnId = (overData.column as Column).id
      } else {
        // over is a column droppable
        targetColumnId = over.id as string
      }

      if (activeColumnId === targetColumnId) return

      // Move card between columns optimistically in UI
      const store = useKanbanStore.getState()
      const targetCards = store.cards[targetColumnId] ?? []
      const newOrder = targetCards.length > 0
        ? (targetCards[targetCards.length - 1].order + 1000)
        : 0

      // Optimistic UI update only (no API call yet — that happens on dragEnd)
      useKanbanStore.setState((state) => {
        const fromCards = (state.cards[activeColumnId] ?? []).filter(
          (c) => c.id !== activeCard.id,
        )
        const updatedCard = { ...activeCard, column_id: targetColumnId, order: newOrder }
        const toCards = [...(state.cards[targetColumnId] ?? []), updatedCard]
        return {
          cards: {
            ...state.cards,
            [activeColumnId]: fromCards,
            [targetColumnId]: toCards,
          },
        }
      })
    },
    [],
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveCard(null)
      setActiveColumn(null)

      if (!over) return

      const activeData = active.data.current
      const overData = over.data.current

      // Column reorder
      if (activeData?.type === 'column' && overData?.type === 'column') {
        const activeIdx = columns.findIndex((c) => c.id === active.id)
        const overIdx = columns.findIndex((c) => c.id === over.id)
        if (activeIdx !== overIdx) {
          const newColumns = arrayMove(columns, activeIdx, overIdx)
          await reorderColumns(newColumns)
        }
        return
      }

      // Card drop
      if (activeData?.type === 'card') {
        const draggedCard = activeData.card as Card

        // Find where the card currently is (after optimistic update)
        const store = useKanbanStore.getState()
        let currentColumnId = draggedCard.column_id

        // Find the card's current column after optimistic moves
        for (const [colId, colCards] of Object.entries(store.cards)) {
          if (colCards.some((c) => c.id === draggedCard.id)) {
            currentColumnId = colId
            break
          }
        }

        const currentCards = store.cards[currentColumnId] ?? []

        // Determine target position
        let targetIndex = currentCards.findIndex((c) => c.id === draggedCard.id)

        if (overData?.type === 'card') {
          const overCard = overData.card as Card
          const overCardCurrentCol = Object.entries(store.cards).find(([, colCards]) =>
            colCards.some((c) => c.id === overCard.id),
          )?.[0]

          if (overCardCurrentCol === currentColumnId) {
            const overIdx = currentCards.findIndex((c) => c.id === overCard.id)
            if (overIdx !== -1 && overIdx !== targetIndex) {
              const reordered = arrayMove(currentCards, targetIndex, overIdx)
              await reorderCardsInColumn(currentColumnId, reordered)
              return
            }
          }
        }

        // Card moved to different column — persist via API
        const newOrder = targetIndex * 1000
        if (currentColumnId !== draggedCard.column_id) {
          await moveCard(draggedCard.id, draggedCard.column_id, currentColumnId, newOrder)
        } else {
          // Same column reorder
          const reordered = currentCards.map((c, i) => ({ ...c, order: i * 1000 }))
          await reorderCardsInColumn(currentColumnId, reordered)
        }
      }
    },
    [columns, reorderColumns, moveCard, reorderCardsInColumn],
  )

  const columnIds = columns.map((c) => c.id)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 overflow-x-auto min-h-full items-start">
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={cards[column.id] ?? []}
            />
          ))}
        </SortableContext>
        <AddColumnBtn boardId={boardId} />
      </div>

      {createPortal(
        <DragOverlay>
          {activeCard && <KanbanCard card={activeCard} isDragOverlay />}
          {activeColumn && (
            <div className="w-72 bg-gray-50 rounded-xl border-2 border-brand-400 opacity-90 shadow-2xl p-3">
              <p className="text-sm font-semibold text-gray-800">{activeColumn.title}</p>
            </div>
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}