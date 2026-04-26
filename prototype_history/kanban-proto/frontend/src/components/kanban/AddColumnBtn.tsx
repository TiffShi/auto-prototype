import { useState } from 'react'
import { useKanbanStore } from '../../store/kanbanStore'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface AddColumnBtnProps {
  boardId: string
}

export default function AddColumnBtn({ boardId }: AddColumnBtnProps) {
  const { createColumn } = useKanbanStore()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Column title is required')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      await createColumn(boardId, title.trim())
      setTitle('')
      setIsEditing(false)
    } catch {
      // handled in store
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTitle('')
    setError('')
  }

  if (!isEditing) {
    return (
      <div className="flex-shrink-0 w-72">
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed
            border-gray-300 text-gray-500 hover:border-brand-400 hover:text-brand-600
            transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Column
        </button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={error}
        placeholder="Column title..."
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') handleCancel()
        }}
      />
      <div className="flex gap-2 mt-2">
        <Button size="sm" onClick={handleSubmit} isLoading={isLoading}>
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}