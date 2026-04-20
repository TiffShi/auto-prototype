import React from 'react'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const SEVERITY_CONFIG = {
  INFO: {
    icon: Info,
    className: 'border-blue-700/30 bg-blue-900/10 text-blue-400',
    iconClass: 'text-blue-400',
  },
  WARNING: {
    icon: AlertTriangle,
    className: 'border-amber-700/30 bg-amber-900/10 text-amber-400',
    iconClass: 'text-amber-400',
  },
  CRITICAL: {
    icon: AlertCircle,
    className: 'border-red-700/30 bg-red-900/10 text-red-400',
    iconClass: 'text-red-400',
  },
}

export default function EventAlert({ event }) {
  const config = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.INFO
  const Icon = config.icon

  return (
    <div className={clsx('flex items-start gap-3 p-3 rounded-lg border animate-slide-in', config.className)}>
      <Icon className={clsx('w-4 h-4 shrink-0 mt-0.5', config.iconClass)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {event.event_type.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-gray-500 shrink-0">
            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{event.description}</p>
      </div>
    </div>
  )
}