import React from 'react'
import DepartmentCard from './DepartmentCard'

export default function DepartmentGrid({ departments, onUpgrade, upgradingId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {departments.map((dept) => (
        <DepartmentCard
          key={dept.id}
          department={dept}
          onUpgrade={onUpgrade}
          isUpgrading={upgradingId === dept.id}
        />
      ))}
    </div>
  )
}