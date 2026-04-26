import { useState } from 'react'
import type { Board } from '../../types'
import { useBoardStore } from '../../store/boardStore'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

interface BoardHeaderProps {
  board: Board
}

export default function BoardHeader({ board }: BoardHeaderProps) {
  const { updateBoard } = useBoardStore()
  const [showEditModal, setShowEditModal] = useState(false)
  const [title, setTitle] = useState(board.title)
  const [description, setDescription] = useState(board.description ?? '')
  const [titleError, setTitleError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Title is required')
      return
    }
    setTitleError('')
    setIsSaving(true)
    try {
      await updateBoard(board.id, title.trim(), description.trim() || undefined)
      setShowEditModal(false)
    } catch {
      // handled in store
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{board.title}</h1>
          {board.description && (
            <p className="text-sm text-gray-500 mt-0.5">{board.description}</p>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setTitle(board.title)
            setDescription(board.description ?? '')
            setShowEditModal(true)
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Board
        </Button>
      </header>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Board"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Board Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={titleError}
            autoFocus
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this board for?"
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}