import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column, Card } from '../../types'
import { useKanbanStore } from '../../store/kanbanStore'
import KanbanCard from './KanbanCard'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface KanbanColumnProps {
  column: Column
  cards: Card[]
}

export default function KanbanColumn({ column, cards }: KanbanColumnProps) {
  const { createCard, updateColumn, deleteColumn } = useKanbanStore()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [cardError, setCardError] = useState('')
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  })

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) {
      setCardError('Card title is required')
      return
    }
    setCardError('')
    setIsCreatingCard(true)
    try {
      await createCard(column.id, newCardTitle.trim())
      setNewCardTitle('')
      setIsAddingCard(false)
    } catch {
      // handled in store
    } finally {
      setIsCreatingCard(false)
    }
  }

  const handleTitleSave = async () => {
    if (!editTitle.trim()) {
      setEditTitle(column.title)
      setIsEditingTitle(false)
      return
    }
    if (editTitle.trim() === column.title) {
      setIsEditingTitle(false)
      return
    }
    try {
      await updateColumn(column.id, editTitle.trim())
    } catch {
      setEditTitle(column.title)
    } finally {
      setIsEditingTitle(false)
    }
  }

  const handleDeleteColumn = async () => {
    if (!confirm(`Delete column "${column.title}" and all its cards?`)) return
    await deleteColumn(column.id)
  }

  const cardIds = cards.map((c) => c.id)

  return (
    <div
      className={`
        flex flex-col flex-shrink-0 w-72 rounded-xl border
        transition-colors duration-150
        ${isOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-gray-50'}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave()
              if (e.key === 'Escape') {
                setEditTitle(column.title)
                setIsEditingTitle(false)
              }
            }}
            className="flex-1 text-sm font-semibold text-gray-800 bg-white border border-brand-400
              rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            autoFocus
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-semibold text-gray-800 hover:text-brand-700
              truncate transition-colors"
            onClick={() => {
              setEditTitle(column.title)
              setIsEditingTitle(true)
            }}
            title="Click to rename"
          >
            {column.title}
          </button>
        )}
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-gray-400 font-medium bg-gray-200 rounded-full px-2 py-0.5">
            {cards.length}
          </span>
          <button
            onClick={handleDeleteColumn}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
            title="Delete column"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[60px] max-h-[calc(100vh-280px)] scrollbar-thin"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      {/* Add Card */}
      <div className="p-2 border-t border-gray-200">
        {isAddingCard ? (
          <div className="flex flex-col gap-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              error={cardError}
              placeholder="Card title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCard()
                if (e.key === 'Escape') {
                  setIsAddingCard(false)
                  setNewCardTitle('')
                  setCardError('')
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddCard} isLoading={isCreatingCard}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingCard(false)
                  setNewCardTitle('')
                  setCardError('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-500
              hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a card
          </button>
        )}
      </div>
    </div>
  )
}