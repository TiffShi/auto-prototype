import { useState, useEffect } from 'react'
import type { Card, Priority } from '../../types'
import { useKanbanStore } from '../../store/kanbanStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import CardBadge from './CardBadge'

interface CardModalProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high']

export default function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const { updateCard, deleteCard } = useKanbanStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [titleError, setTitleError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description ?? '')
      setDueDate(card.due_date ?? '')
      setPriority(card.priority)
      setTitleError('')
    }
  }, [card])

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Title is required')
      return
    }
    if (!card) return
    setTitleError('')
    setIsSaving(true)
    try {
      await updateCard(card.id, card.column_id, {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        priority,
      })
      onClose()
    } catch {
      // handled in store
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!card) return
    if (!confirm('Delete this card? This cannot be undone.')) return
    setIsDeleting(true)
    try {
      await deleteCard(card.id, card.column_id)
      onClose()
    } catch {
      // handled in store
    } finally {
      setIsDeleting(false)
    }
  }

  if (!card) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Card" size="lg">
      <div className="flex flex-col gap-5">
        {/* Title */}
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          autoFocus
        />

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Add a description..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
              placeholder-gray-400 shadow-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Due Date + Priority row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all
                    ${priority === p
                      ? 'ring-2 ring-offset-1 ring-brand-500 scale-105'
                      : 'opacity-60 hover:opacity-100'
                    }`}
                >
                  <CardBadge priority={p} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-3">
          <span>Created: {new Date(card.created_at).toLocaleString()}</span>
          {card.updated_at !== card.created_at && (
            <span className="ml-4">Updated: {new Date(card.updated_at).toLocaleString()}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Card
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}