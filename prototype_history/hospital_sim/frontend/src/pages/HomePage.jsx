import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cross, Plus, Play, Activity } from 'lucide-react'
import { createHospital, listHospitals } from '../api/hospitalApi'
import { useHospitalStore } from '../store/hospitalStore'
import { useSimulationStore } from '../store/simulationStore'
import { formatDistanceToNow } from 'date-fns'

export default function HomePage() {
  const [hospitalName, setHospitalName] = useState('')
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setHospital = useHospitalStore((s) => s.setHospital)
  const reset = useSimulationStore((s) => s.reset)

  useEffect(() => {
    loadHospitals()
  }, [])

  const loadHospitals = async () => {
    setLoadingList(true)
    try {
      const data = await listHospitals()
      setHospitals(data)
    } catch (e) {
      console.error('Failed to load hospitals', e)
    } finally {
      setLoadingList(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!hospitalName.trim()) {
      setError('Please enter a hospital name')
      return
    }
    setLoading(true)
    setError('')
    try {
      const hospital = await createHospital(hospitalName.trim())
      reset()
      setHospital(hospital.id, hospital.name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create hospital')
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = (hospital) => {
    reset()
    setHospital(hospital.id, hospital.name)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(#00d4aa 1px, transparent 1px), linear-gradient(90deg, #00d4aa 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-medical-green/10 border-2 border-medical-green/30 rounded-2xl mb-4">
            <Cross className="w-10 h-10 text-medical-green" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Hospital <span className="text-gradient">Simulator</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Manage departments, staff, patients, and resources in real time
          </p>
        </div>

        {/* Create new hospital */}
        <div className="card border border-medical-green/20 mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-medical-green" />
            Start New Hospital
          </h2>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              className="input flex-1"
              placeholder="Enter hospital name..."
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              maxLength={100}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>
          </form>
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
          <div className="mt-3 text-xs text-gray-500">
            Starting budget: $500,000 • 5 departments • Full simulation engine
          </div>
        </div>

        {/* Existing hospitals */}
        {!loadingList && hospitals.length > 0 && (
          <div className="card border border-navy-600">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Continue Existing Hospital
            </h2>
            <div className="space-y-2">
              {hospitals.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleLoad(h)}
                  className="w-full flex items-center justify-between p-3 bg-navy-700 hover:bg-navy-600 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-medical-green/10 rounded-lg flex items-center justify-center">
                      <Cross className="w-4 h-4 text-medical-green" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white text-sm">{h.name}</div>
                      <div className="text-xs text-gray-500">
                        Day {h.day} •{' '}
                        {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-mono text-medical-green">
                        ${parseFloat(h.budget).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-gray-500">budget</div>
                    </div>
                    <Play className="w-4 h-4 text-gray-500 group-hover:text-medical-green transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingList && (
          <div className="text-center text-gray-500 text-sm py-4">
            <Activity className="w-5 h-5 animate-spin mx-auto mb-2" />
            Loading hospitals...
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Real-time Simulation', desc: 'Live patient flow & events' },
            { label: 'Staff Management', desc: 'Hire, assign & track fatigue' },
            { label: 'Financial Tracking', desc: 'Revenue, expenses & budget' },
          ].map((f) => (
            <div key={f.label} className="text-center p-3 bg-navy-800/50 rounded-lg border border-navy-700">
              <div className="text-xs font-semibold text-medical-green mb-1">{f.label}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}