import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoardStore } from '../../store/boardStore'
import { useAuthStore } from '../../store/authStore'
import type { Board } from '../../types'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Input from '../ui/Input'

interface BoardSidebarProps {
  currentBoardId?: string
}

export default function BoardSidebar({ currentBoardId }: BoardSidebarProps) {
  const navigate = useNavigate()
  const { boards, createBoard, deleteBoard, isLoading } = useBoardStore()
  const { user, logout } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardDesc, setNewBoardDesc] = useState('')
  const [titleError, setTitleError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!newBoardTitle.trim()) {
      setTitleError('Board title is required')
      return
    }
    setTitleError('')
    setIsCreating(true)
    try {
      const board = await createBoard(newBoardTitle.trim(), newBoardDesc.trim() || undefined)
      setShowCreateModal(false)
      setNewBoardTitle('')
      setNewBoardDesc('')
      navigate(`/board/${board.id}`)
    } catch {
      // handled in store
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, board: Board) => {
    e.stopPropagation()
    if (!confirm(`Delete board "${board.title}"? This cannot be undone.`)) return
    await deleteBoard(board.id)
    if (currentBoardId === board.id) {
      navigate('/dashboard')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="px-4 py-5 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <span className="font-bold text-lg">KanbanApp</span>
          </div>
          {user && (
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          )}
        </div>

        {/* Boards list */}
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Boards
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded"
              title="Create new board"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {isLoading && boards.length === 0 ? (
            <div className="px-4 text-sm text-gray-500">Loading...</div>
          ) : boards.length === 0 ? (
            <div className="px-4 text-sm text-gray-500">No boards yet</div>
          ) : (
            <ul className="space-y-0.5 px-2">
              {boards.map((board) => (
                <li key={board.id}>
                  <div
                    className={`
                      group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                      transition-colors text-sm
                      ${currentBoardId === board.id
                        ? 'bg-brand-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                    onClick={() => navigate(`/board/${board.id}`)}
                  >
                    <span className="truncate flex-1">{board.title}</span>
                    <button
                      onClick={(e) => handleDelete(e, board)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all ml-2 p-0.5 rounded"
                      title="Delete board"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Create Board Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setNewBoardTitle('')
          setNewBoardDesc('')
          setTitleError('')
        }}
        title="Create New Board"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Board Title"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            error={titleError}
            placeholder="e.g. Product Roadmap"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Input
            label="Description (optional)"
            value={newBoardDesc}
            onChange={(e) => setNewBoardDesc(e.target.value)}
            placeholder="What is this board for?"
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false)
                setNewBoardTitle('')
                setNewBoardDesc('')
                setTitleError('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={isCreating}>
              Create Board
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}