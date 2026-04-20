import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  Package,
  DollarSign,
  LogOut,
  Activity,
  Cross,
} from 'lucide-react'
import { useHospitalStore } from '../../store/hospitalStore'
import { useSimulationStore } from '../../store/simulationStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/departments', icon: Building2, label: 'Departments' },
  { to: '/staff', icon: UserCog, label: 'Staff' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/financials', icon: DollarSign, label: 'Financials' },
]

export default function Sidebar() {
  const hospitalName = useHospitalStore((s) => s.hospitalName)
  const clearHospital = useHospitalStore((s) => s.clearHospital)
  const stats = useHospitalStore((s) => s.stats)
  const isConnected = useSimulationStore((s) => s.isConnected)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearHospital()
    navigate('/')
  }

  const budget = stats?.hospital?.budget ?? 0

  return (
    <aside className="w-60 bg-navy-800 border-r border-navy-600 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-navy-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-medical-green/20 border border-medical-green/40 rounded-lg flex items-center justify-center">
            <Cross className="w-5 h-5 text-medical-green" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">HospitalSim</div>
            <div className="text-xs text-gray-500">Management System</div>
          </div>
        </div>
      </div>

      {/* Hospital Info */}
      <div className="p-4 border-b border-navy-600">
        <div className="flex items-center gap-2 mb-2">
          <div className={clsx('w-2 h-2 rounded-full', isConnected ? 'bg-medical-green animate-pulse' : 'bg-gray-500')} />
          <span className="text-xs text-gray-400">{isConnected ? 'Live' : 'Offline'}</span>
        </div>
        <div className="text-sm font-semibold text-white truncate">{hospitalName}</div>
        <div className="text-xs text-medical-green font-mono mt-1">
          ${budget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-navy-600">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Hospital</span>
        </button>
      </div>
    </aside>
  )
}