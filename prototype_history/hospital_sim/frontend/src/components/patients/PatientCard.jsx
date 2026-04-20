import React from 'react'
import { User, Clock, Activity } from 'lucide-react'
import { PatientStatusBadge, SeverityBadge } from './PatientStatusBadge'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default function PatientCard({ patient, onUpdateStatus, departments }) {
  const admittedAgo = formatDistanceToNow(new Date(patient.admitted_at), { addSuffix: true })

  const treatmentProgress =
    patient.status === 'IN_TREATMENT'
      ? Math.min(100, Math.round((patient.ticks_in_treatment / patient.required_ticks) * 100))
      : 0

  return (
    <div
      className={clsx(
        'card border transition-all duration-200',
        patient.severity === 'CRITICAL' && patient.status === 'WAITING'
          ? 'border-red-500/50 glow-red'
          : 'border-navy-600'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{patient.name}</div>
            <div className="text-xs text-gray-500">Age {patient.age}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SeverityBadge severity={patient.severity} />
          <PatientStatusBadge status={patient.status} />
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-2">
        <Activity className="w-3 h-3 inline mr-1" />
        {patient.condition}
      </div>

      {patient.status === 'IN_TREATMENT' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Treatment Progress</span>
            <span>{treatmentProgress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill bg-medical-green"
              style={{ width: `${treatmentProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {admittedAgo}
        </div>
        <div className="text-xs text-medical-green font-mono">
          ${patient.treatment_cost.toLocaleString()}
        </div>
      </div>

      {/* Action buttons */}
      {onUpdateStatus && patient.status === 'WAITING' && (
        <div className="mt-3 flex gap-2">
          <select
            className="select text-xs flex-1"
            onChange={(e) => {
              if (e.target.value) {
                onUpdateStatus(patient.id, 'IN_TREATMENT', e.target.value)
                e.target.value = ''
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Assign to dept...</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id} disabled={d.available_beds === 0}>
                {d.name} ({d.available_beds} beds)
              </option>
            ))}
          </select>
        </div>
      )}

      {onUpdateStatus && patient.status === 'IN_TREATMENT' && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onUpdateStatus(patient.id, 'DISCHARGED')}
            className="btn-primary text-xs flex-1 justify-center"
          >
            Discharge
          </button>
          <button
            onClick={() => onUpdateStatus(patient.id, 'DECEASED')}
            className="btn-danger text-xs flex-1 justify-center"
          >
            Deceased
          </button>
        </div>
      )}
    </div>
  )
}