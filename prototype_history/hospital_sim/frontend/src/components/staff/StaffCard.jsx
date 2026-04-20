import React from 'react'
import { UserCog, Trash2, Building2 } from 'lucide-react'
import clsx from 'clsx'

const ROLE_COLORS = {
  DOCTOR: 'text-medical-blue',
  NURSE: 'text-medical-green',
  SURGEON: 'text-purple-400',
  PHARMACIST: 'text-amber-400',
  ADMIN: 'text-gray-400',
}

const SHIFT_COLORS = {
  DAY: 'text-amber-400',
  NIGHT: 'text-blue-400',
}

export default function StaffCard({ staff, onFire, onAssign, departments }) {
  const fatigueColor =
    staff.fatigue > 80
      ? 'bg-red-500'
      : staff.fatigue > 60
      ? 'bg-amber-500'
      : 'bg-medical-green'

  const dept = departments?.find((d) => d.id === staff.department_id)

  return (
    <tr className="table-row">
      <td className="table-cell">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-navy-700 rounded-full flex items-center justify-center">
            <UserCog className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-white text-sm">{staff.name}</div>
            <div className="text-xs text-gray-500">Skill Lv.{staff.skill_level}</div>
          </div>
        </div>
      </td>
      <td className="table-cell">
        <span className={clsx('text-sm font-semibold', ROLE_COLORS[staff.role])}>
          {staff.role}
        </span>
      </td>
      <td className="table-cell">
        <span className={clsx('text-xs', SHIFT_COLORS[staff.shift])}>
          {staff.shift}
        </span>
      </td>
      <td className="table-cell">
        <div className="flex items-center gap-2">
          <div className="progress-bar w-16">
            <div
              className={clsx('progress-fill', fatigueColor)}
              style={{ width: `${staff.fatigue}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{staff.fatigue}%</span>
        </div>
      </td>
      <td className="table-cell">
        <div className={clsx('w-2 h-2 rounded-full inline-block mr-2', staff.is_available ? 'bg-medical-green' : 'bg-red-500')} />
        <span className="text-xs text-gray-400">{staff.is_available ? 'Available' : 'Unavailable'}</span>
      </td>
      <td className="table-cell">
        <div className="text-xs text-gray-300 font-mono">
          ${staff.salary.toLocaleString()}/mo
        </div>
      </td>
      <td className="table-cell">
        <div className="flex items-center gap-2">
          <select
            className="select text-xs w-32"
            value={staff.department_id || ''}
            onChange={(e) => onAssign(staff.id, e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={() => onFire(staff.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}