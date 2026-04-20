import React from 'react'
import StaffCard from './StaffCard'

export default function StaffTable({ staff, onFire, onAssign, departments }) {
  if (staff.length === 0) {
    return (
      <div className="card text-center py-12 text-gray-500">
        <p className="text-sm">No staff hired yet. Hire your first staff member!</p>
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-navy-700/50 border-b border-navy-600">
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Role</th>
              <th className="table-header">Shift</th>
              <th className="table-header">Fatigue</th>
              <th className="table-header">Status</th>
              <th className="table-header">Salary</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <StaffCard
                key={s.id}
                staff={s}
                onFire={onFire}
                onAssign={onAssign}
                departments={departments}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}