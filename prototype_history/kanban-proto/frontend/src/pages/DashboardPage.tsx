import { useEffect, useState } from 'react'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import BoardList from '../components/board/BoardList'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'

export default function DashboardPage() {
  const { boards, fetchBoards, createBoard, isLoading } = useBoardStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [titleError, setTitleError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchBoards()
  }, [])

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setTitleError('Board title is required')
      return
    }
    setTitleError('')
    setIsCreating(true)
    try {
      const board = await createBoard(newTitle.trim(), newDesc.trim() || undefined)
      setShowCreateModal(false)
      setNewTitle('')
      setNewDesc('')
      navigate(`/board/${board.id}`)
    } catch {
      // handled in store
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">KanbanApp</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            )}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {boards.length} board{boards.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <BoardList boards={boards} />
        )}
      </main>

      {/* Create Board Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setNewTitle('')
          setNewDesc('')
          setTitleError('')
        }}
        title="Create New Board"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Board Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            error={titleError}
            placeholder="e.g. Product Roadmap"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Input
            label="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="What is this board for?"
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false)
                setNewTitle('')
                setNewDesc('')
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
    </div>
  )
}