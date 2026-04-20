import React from 'react'
import clsx from 'clsx'

const STATUS_CONFIG = {
  WAITING: { label: 'Waiting', className: 'badge-waiting' },
  IN_TREATMENT: { label: 'In Treatment', className: 'badge-treatment' },
  DISCHARGED: { label: 'Discharged', className: 'badge-discharged' },
  DECEASED: { label: 'Deceased', className: 'badge-deceased' },
}

const SEVERITY_CONFIG = {
  LOW: { label: 'Low', className: 'badge-low' },
  MEDIUM: { label: 'Medium', className: 'badge-medium' },
  CRITICAL: { label: 'Critical', className: 'badge-critical' },
}

export function PatientStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge' }
  return <span className={config.className}>{config.label}</span>
}

export function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity] || { label: severity, className: 'badge' }
  return <span className={config.className}>{config.label}</span>
}