import { useNavigate } from 'react-router-dom'
import type { Board } from '../../types'
import { useBoardStore } from '../../store/boardStore'
import Button from '../ui/Button'

interface BoardListProps {
  boards: Board[]
}

export default function BoardList({ boards }: BoardListProps) {
  const navigate = useNavigate()
  const { deleteBoard } = useBoardStore()

  const handleDelete = async (e: React.MouseEvent, board: Board) => {
    e.stopPropagation()
    if (!confirm(`Delete board "${board.title}"? This cannot be undone.`)) return
    await deleteBoard(board.id)
  }

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No boards yet</h3>
        <p className="text-sm text-gray-500">Create your first board to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {boards.map((board) => (
        <div
          key={board.id}
          onClick={() => navigate(`/board/${board.id}`)}
          className="group relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer
            hover:border-brand-400 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
              onClick={(e) => handleDelete(e, board)}
              title="Delete board"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{board.title}</h3>
          {board.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{board.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-3">
            {new Date(board.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}