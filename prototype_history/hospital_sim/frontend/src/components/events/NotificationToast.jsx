import React from 'react'
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const TYPE_CONFIG = {
  info: { icon: Info, className: 'border-blue-700/50 bg-navy-800 text-blue-400' },
  warning: { icon: AlertTriangle, className: 'border-amber-700/50 bg-navy-800 text-amber-400' },
  critical: { icon: AlertCircle, className: 'border-red-700/50 bg-navy-800 text-red-400' },
  success: { icon: CheckCircle, className: 'border-emerald-700/50 bg-navy-800 text-emerald-400' },
}

export default function NotificationToast({ notification, onClose }) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info
  const Icon = config.icon

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-3 rounded-xl border shadow-xl animate-slide-in',
        config.className
      )}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <p className="text-sm text-gray-200 flex-1">{notification.message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-white shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}