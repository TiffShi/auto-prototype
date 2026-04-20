import React, { useState } from 'react'
import { X, UserPlus } from 'lucide-react'

const ROLES = ['DOCTOR', 'NURSE', 'SURGEON', 'PHARMACIST', 'ADMIN']
const SHIFTS = ['DAY', 'NIGHT']

const SALARY_ESTIMATES = {
  DOCTOR: 8000,
  NURSE: 4000,
  SURGEON: 12000,
  PHARMACIST: 5000,
  ADMIN: 3000,
}

export default function HireStaffModal({ onClose, onHire, departments }) {
  const [form, setForm] = useState({
    name: '',
    role: 'DOCTOR',
    skill_level: 5,
    shift: 'DAY',
    department_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const estimatedSalary = Math.round(
    SALARY_ESTIMATES[form.role] * (1 + (form.skill_level - 1) * 0.1)
  )
  const hiringCost = Math.round(estimatedSalary * 0.5)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onHire({
        ...form,
        skill_level: parseInt(form.skill_level),
        department_id: form.department_id || null,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to hire staff')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-medical-green" />
            <h2 className="text-lg font-bold text-white">Hire Staff Member</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Full Name</label>
            <input
              className="input"
              placeholder="Dr. Jane Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Role</label>
              <select
                className="select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Shift</label>
              <select
                className="select"
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
              >
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Skill Level: {form.skill_level}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={form.skill_level}
              onChange={(e) => setForm({ ...form, skill_level: e.target.value })}
              className="w-full accent-medical-green"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Department (optional)</label>
            <select
              className="select"
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            >
              <option value="">Unassigned</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Cost preview */}
          <div className="bg-navy-700 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Monthly Salary</span>
              <span className="text-white font-mono">${estimatedSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400 mt-1">
              <span>One-time Hiring Fee</span>
              <span className="text-amber-400 font-mono">${hiringCost.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-900/20 border border-red-700/30 rounded-lg p-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Hiring...' : `Hire ($${hiringCost.toLocaleString()})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}