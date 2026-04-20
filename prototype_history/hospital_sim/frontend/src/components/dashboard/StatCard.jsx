import React from 'react'
import clsx from 'clsx'

export default function StatCard({ label, value, icon: Icon, color = 'green', subtitle, trend }) {
  const colorMap = {
    green: 'text-medical-green bg-medical-green/10 border-medical-green/20',
    blue: 'text-medical-blue bg-medical-blue/10 border-medical-blue/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    yellow: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  }

  const iconColor = {
    green: 'text-medical-green',
    blue: 'text-medical-blue',
    red: 'text-red-400',
    yellow: 'text-amber-400',
    purple: 'text-purple-400',
  }

  return (
    <div className={clsx('card border', colorMap[color], 'glow-' + (color === 'green' ? 'green' : color === 'blue' ? 'blue' : ''))}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="stat-label mb-2">{label}</div>
          <div className="stat-value">{value}</div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
          )}
          {trend !== undefined && (
            <div className={clsx('text-xs mt-1', trend >= 0 ? 'text-medical-green' : 'text-red-400')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center bg-navy-700', iconColor[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}