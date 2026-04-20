import React, { useEffect, useState, useCallback } from 'react'
import { Users, RefreshCw, UserPlus, Filter } from 'lucide-react'
import PatientQueue from '../components/patients/PatientQueue'
import { PatientStatusBadge } from '../components/patients/PatientStatusBadge'
import { useHospitalStore } from '../store/hospitalStore'
import { getPatients, generatePatient, updatePatientStatus } from '../api/patientApi'
import { getDepartments } from '../api/hospitalApi'
import { useNotificationStore } from '../store/notificationStore'

const STATUS_FILTERS = ['ALL', 'WAITING', 'IN_TREATMENT', 'DISCHARGED', 'DECEASED']

export default function PatientsPage() {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  const [patients, setPatients] = useState([])
  const [departments, setDepartments] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const loadData = useCallback(async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      const [pts, depts] = await Promise.all([
        getPatients(hospitalId),
        getDepartments(hospitalId),
      ])
      setPatients(pts)
      setDepartments(depts)
    } catch (e) {
      console.error('Failed to load patients', e)
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 8000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const patient = await generatePatient(hospitalId)
      addNotification(`New patient arrived: ${patient.name} (${patient.severity})`, 
        patient.severity === 'CRITICAL' ? 'critical' : 'info')
      await loadData()
    } catch (e) {
      addNotification('Failed to generate patient', 'warning')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdateStatus = async (patientId, status, departmentId = null) => {
    try {
      await updatePatientStatus(patientId, status, departmentId)
      await loadData()
      addNotification(`Patient status updated to ${status}`, 'success')
    } catch (e) {
      addNotification(e.response?.data?.detail || 'Failed to update patient', 'warning')
    }
  }

  const filteredPatients =
    filter === 'ALL' ? patients : patients.filter((p) => p.status === filter)

  const counts = {
    ALL: patients.length,
    WAITING: patients.filter((p) => p.status === 'WAITING').length,
    IN_TREATMENT: patients.filter((p) => p.status === 'IN_TREATMENT').length,
    DISCHARGED: patients.filter((p) => p.status === 'DISCHARGED').length,
    DECEASED: patients.filter((p) => p.status === 'DECEASED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-medical-blue" />
            Patients
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{patients.length} total patients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} disabled={loading} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Patient'}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === s
                ? 'bg-medical-green text-navy-900'
                : 'bg-navy-700 text-gray-400 hover:text-white border border-navy-600'
            }`}
          >
            {s.replace('_', ' ')} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Patient queue */}
      <PatientQueue
        patients={filteredPatients}
        onUpdateStatus={
          filter === 'ALL' || filter === 'WAITING' || filter === 'IN_TREATMENT'
            ? handleUpdateStatus
            : null
        }
        departments={departments}
      />
    </div>
  )
}