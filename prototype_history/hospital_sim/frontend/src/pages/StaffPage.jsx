import React, { useEffect, useState, useCallback } from 'react'
import { UserCog, RefreshCw, UserPlus } from 'lucide-react'
import StaffTable from '../components/staff/StaffTable'
import HireStaffModal from '../components/staff/HireStaffModal'
import { useHospitalStore } from '../store/hospitalStore'
import { getStaff, hireStaff, fireStaff, assignStaff } from '../api/staffApi'
import { getDepartments } from '../api/hospitalApi'
import { useNotificationStore } from '../store/notificationStore'

export default function StaffPage() {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  const [staff, setStaff] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showHireModal, setShowHireModal] = useState(false)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const loadData = useCallback(async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      const [staffData, deptData] = await Promise.all([
        getStaff(hospitalId),
        getDepartments(hospitalId),
      ])
      setStaff(staffData)
      setDepartments(deptData)
    } catch (e) {
      console.error('Failed to load staff', e)
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleHire = async (data) => {
    const member = await hireStaff(hospitalId, data)
    addNotification(`${member.name} hired as ${member.role}`, 'success')
    await loadData()
  }

  const handleFire = async (staffId) => {
    if (!confirm('Are you sure you want to fire this staff member?')) return
    try {
      await fireStaff(staffId)
      addNotification('Staff member fired', 'info')
      await loadData()
    } catch (e) {
      addNotification('Failed to fire staff member', 'warning')
    }
  }

  const handleAssign = async (staffId, departmentId) => {
    try {
      await assignStaff(staffId, departmentId)
      await loadData()
    } catch (e) {
      addNotification('Failed to assign staff', 'warning')
    }
  }

  const roleCount = staff.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1
    return acc
  }, {})

  const totalSalary = staff.reduce((sum, s) => sum + s.salary, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-medical-green" />
            Staff Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {staff.length} staff members • ${totalSalary.toLocaleString()}/mo total salary
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} disabled={loading} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowHireModal(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            Hire Staff
          </button>
        </div>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-5 gap-3">
        {['DOCTOR', 'NURSE', 'SURGEON', 'PHARMACIST', 'ADMIN'].map((role) => (
          <div key={role} className="card border border-navy-600 text-center">
            <div className="text-xl font-bold text-white">{roleCount[role] || 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">{role}</div>
          </div>
        ))}
      </div>

      {/* Staff table */}
      {loading && staff.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading staff...</div>
      ) : (
        <StaffTable
          staff={staff}
          onFire={handleFire}
          onAssign={handleAssign}
          departments={departments}
        />
      )}

      {/* Hire modal */}
      {showHireModal && (
        <HireStaffModal
          onClose={() => setShowHireModal(false)}
          onHire={handleHire}
          departments={departments}
        />
      )}
    </div>
  )
}