import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBoardStore } from '../store/boardStore'
import { useKanbanStore } from '../store/kanbanStore'
import BoardSidebar from '../components/board/BoardSidebar'
import BoardHeader from '../components/board/BoardHeader'
import KanbanBoard from '../components/kanban/KanbanBoard'
import Spinner from '../components/ui/Spinner'

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { boards, fetchBoards, isLoading: boardsLoading } = useBoardStore()
  const { loadBoard, isLoading: kanbanLoading, error, reset } = useKanbanStore()

  const board = boards.find((b) => b.id === boardId)

  useEffect(() => {
    if (boards.length === 0) {
      fetchBoards()
    }
  }, [])

  useEffect(() => {
    if (boardId) {
      reset()
      loadBoard(boardId)
    }
    return () => {
      reset()
    }
  }, [boardId])

  if (boardsLoading && !board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!boardsLoading && !board && boards.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Board not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-brand-600 hover:underline text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <BoardSidebar currentBoardId={boardId} />

      <div className="flex flex-col flex-1 min-w-0">
        {board && <BoardHeader board={board} />}

        {kanbanLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={() => boardId && loadBoard(boardId)}
                className="text-brand-600 hover:underline text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : boardId ? (
          <div className="flex-1 overflow-auto">
            <KanbanBoard boardId={boardId} />
          </div>
        ) : null}
      </div>
    </div>
  )
}