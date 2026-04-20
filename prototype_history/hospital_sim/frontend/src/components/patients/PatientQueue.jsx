import React from 'react'
import PatientCard from './PatientCard'
import { AlertTriangle } from 'lucide-react'

const SEVERITY_ORDER = { CRITICAL: 0, MEDIUM: 1, LOW: 2 }

export default function PatientQueue({ patients, onUpdateStatus, departments }) {
  const sorted = [...patients].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No patients in queue</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((p) => (
        <PatientCard
          key={p.id}
          patient={p}
          onUpdateStatus={onUpdateStatus}
          departments={departments}
        />
      ))}
    </div>
  )
}