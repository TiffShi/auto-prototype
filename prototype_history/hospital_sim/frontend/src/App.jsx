import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useHospitalStore } from './store/hospitalStore'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import DepartmentsPage from './pages/DepartmentsPage'
import StaffPage from './pages/StaffPage'
import InventoryPage from './pages/InventoryPage'
import FinancialsPage from './pages/FinancialsPage'
import Layout from './components/layout/Layout'

function ProtectedRoute({ children }) {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  if (!hospitalId) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <Layout>
                <PatientsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <Layout>
                <DepartmentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Layout>
                <StaffPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <InventoryPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/financials"
          element={
            <ProtectedRoute>
              <Layout>
                <FinancialsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}