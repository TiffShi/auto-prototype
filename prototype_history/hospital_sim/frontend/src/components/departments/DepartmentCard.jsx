import React from 'react'
import { Bed, TrendingUp, Users, ArrowUpCircle } from 'lucide-react'
import clsx from 'clsx'

const DEPT_COLORS = {
  ER: 'border-red-500/30 bg-red-500/5',
  ICU: 'border-purple-500/30 bg-purple-500/5',
  GENERAL: 'border-medical-blue/30 bg-medical-blue/5',
  SURGERY: 'border-amber-500/30 bg-amber-500/5',
  PHARMACY: 'border-medical-green/30 bg-medical-green/5',
}

const DEPT_ICON_COLORS = {
  ER: 'text-red-400',
  ICU: 'text-purple-400',
  GENERAL: 'text-medical-blue',
  SURGERY: 'text-amber-400',
  PHARMACY: 'text-medical-green',
}

export default function DepartmentCard({ department, onUpgrade, isUpgrading }) {
  const occupancyPct =
    department.bed_capacity > 0
      ? Math.round((department.current_occupancy / department.bed_capacity) * 100)
      : 0

  const upgradeCost = 25000 * department.upgrade_level

  const barColor =
    occupancyPct > 90
      ? 'bg-red-500'
      : occupancyPct > 70
      ? 'bg-amber-500'
      : 'bg-medical-green'

  return (
    <div className={clsx('card border rounded-xl', DEPT_COLORS[department.type])}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-bold text-white">{department.name}</div>
          <div className={clsx('text-xs font-semibold mt-0.5', DEPT_ICON_COLORS[department.type])}>
            {department.type}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-navy-700 px-2 py-1 rounded-lg">
          <TrendingUp className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">Lv.{department.upgrade_level}</span>
        </div>
      </div>

      {/* Bed stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{department.bed_capacity}</div>
          <div className="text-xs text-gray-500">Total Beds</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{department.current_occupancy}</div>
          <div className="text-xs text-gray-500">Occupied</div>
        </div>
        <div className="text-center">
          <div className={clsx('text-lg font-bold', department.available_beds === 0 ? 'text-red-400' : 'text-medical-green')}>
            {department.available_beds}
          </div>
          <div className="text-xs text-gray-500">Available</div>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Occupancy</span>
          <span>{occupancyPct}%</span>
        </div>
        <div className="progress-bar">
          <div
            className={clsx('progress-fill', barColor)}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      {/* Upgrade button */}
      {department.type !== 'PHARMACY' && (
        <button
          onClick={() => onUpgrade(department.id)}
          disabled={isUpgrading}
          className="btn-secondary w-full justify-center text-xs"
        >
          <ArrowUpCircle className="w-3 h-3" />
          Upgrade (${upgradeCost.toLocaleString()})
        </button>
      )}
    </div>
  )
}