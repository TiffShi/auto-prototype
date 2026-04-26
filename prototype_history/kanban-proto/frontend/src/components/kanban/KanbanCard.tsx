import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '../../types'
import CardBadge from '../card/CardBadge'
import CardModal from '../card/CardModal'

interface KanbanCardProps {
  card: Card
  isDragOverlay?: boolean
}

export default function KanbanCard({ card, isDragOverlay = false }: KanbanCardProps) {
  const [showModal, setShowModal] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = card.due_date && new Date(card.due_date) < new Date()

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`
          group bg-white rounded-lg border border-gray-200 p-3 shadow-sm
          cursor-grab active:cursor-grabbing
          transition-shadow duration-150
          ${isDragging ? 'opacity-40 shadow-none' : 'hover:shadow-md hover:border-gray-300'}
          ${isDragOverlay ? 'shadow-xl rotate-2 cursor-grabbing' : ''}
        `}
      >
        {/* Drag handle + click area */}
        <div
          {...listeners}
          className="flex items-start gap-2"
          onClick={(e) => {
            // Only open modal if not dragging
            if (!isDragging) {
              e.stopPropagation()
              setShowModal(true)
            }
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-snug break-words">
              {card.title}
            </p>
            {card.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <CardBadge priority={card.priority} />
          {card.due_date && (
            <span
              className={`text-xs font-medium ${
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {isOverdue && '⚠ '}
              {new Date(card.due_date + 'T00:00:00').toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      <CardModal
        card={card}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}