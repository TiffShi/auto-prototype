import React, { useEffect, useState, useCallback } from 'react'
import { Building2, RefreshCw } from 'lucide-react'
import DepartmentGrid from '../components/departments/DepartmentGrid'
import { useHospitalStore } from '../store/hospitalStore'
import { getDepartments, upgradeDepartment } from '../api/hospitalApi'
import { useNotificationStore } from '../store/notificationStore'

export default function DepartmentsPage() {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [upgradingId, setUpgradingId] = useState(null)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const loadDepartments = useCallback(async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      const data = await getDepartments(hospitalId)
      setDepartments(data)
    } catch (e) {
      console.error('Failed to load departments', e)
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  const handleUpgrade = async (deptId) => {
    setUpgradingId(deptId)
    try {
      const updated = await upgradeDepartment(deptId)
      addNotification(`${updated.name} upgraded to Level ${updated.upgrade_level}!`, 'success')
      await loadDepartments()
    } catch (e) {
      addNotification(e.response?.data?.detail || 'Upgrade failed', 'warning')
    } finally {
      setUpgradingId(null)
    }
  }

  const totalBeds = departments.reduce((sum, d) => sum + d.bed_capacity, 0)
  const totalOccupied = departments.reduce((sum, d) => sum + d.current_occupancy, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Departments
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalOccupied}/{totalBeds} beds occupied across {departments.length} departments
          </p>
        </div>
        <button onClick={loadDepartments} disabled={loading} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary bar */}
      <div className="card border border-navy-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Occupancy</span>
          <span className="text-sm font-semibold text-white">
            {totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${
              totalBeds > 0 && totalOccupied / totalBeds > 0.9
                ? 'bg-red-500'
                : totalBeds > 0 && totalOccupied / totalBeds > 0.7
                ? 'bg-amber-500'
                : 'bg-medical-green'
            }`}
            style={{
              width: `${totalBeds > 0 ? (totalOccupied / totalBeds) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Department grid */}
      {loading && departments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading departments...</div>
      ) : (
        <DepartmentGrid
          departments={departments}
          onUpgrade={handleUpgrade}
          upgradingId={upgradingId}
        />
      )}
    </div>
  )
}