import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BoardPage from './pages/BoardPage'
import Spinner from './components/ui/Spinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore()
  if (!token && !user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore()
  if (token && user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { fetchMe, isLoading, token } = useAuthStore()

  useEffect(() => {
    if (token) {
      fetchMe()
    }
  }, [])

  if (isLoading && token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/board/:boardId"
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}