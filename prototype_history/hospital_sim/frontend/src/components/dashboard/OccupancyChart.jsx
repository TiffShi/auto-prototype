import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-700 border border-navy-500 rounded-lg p-3 text-xs">
        <p className="font-semibold text-white mb-1">{label}</p>
        <p className="text-medical-green">Occupied: {payload[0]?.value}</p>
        <p className="text-gray-400">Capacity: {payload[1]?.value}</p>
      </div>
    )
  }
  return null
}

export default function OccupancyChart({ departments }) {
  const data = departments.map((d) => ({
    name: d.name.replace('Intensive Care Unit', 'ICU').replace('Emergency Room', 'ER').replace('General Ward', 'General'),
    occupied: d.current_occupancy,
    capacity: d.bed_capacity,
    pct: d.bed_capacity > 0 ? Math.round((d.current_occupancy / d.bed_capacity) * 100) : 0,
  }))

  return (
    <div className="card">
      <div className="card-header">Department Occupancy</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#162040" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#162040' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#162040' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="occupied" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.pct > 90
                    ? '#ef4444'
                    : entry.pct > 70
                    ? '#f59e0b'
                    : '#00d4aa'
                }
              />
            ))}
          </Bar>
          <Bar dataKey="capacity" fill="#162040" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}