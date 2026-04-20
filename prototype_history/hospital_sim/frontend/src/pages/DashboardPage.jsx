import React, { useEffect, useState, useCallback } from 'react'
import {
  Bed,
  Users,
  DollarSign,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  UserCog,
} from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import OccupancyChart from '../components/dashboard/OccupancyChart'
import RevenueChart from '../components/dashboard/RevenueChart'
import EventFeed from '../components/events/EventFeed'
import { useHospitalStore } from '../store/hospitalStore'
import { useNotificationStore } from '../store/notificationStore'
import { getDepartments, getFinancials, getEvents } from '../api/hospitalApi'
import { generatePatient } from '../api/patientApi'
import { UserPlus } from 'lucide-react'

export default function DashboardPage() {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  const stats = useHospitalStore((s) => s.stats)
  const setDepartments = useHospitalStore((s) => s.setDepartments)
  const departments = useHospitalStore((s) => s.departments)
  const events = useNotificationStore((s) => s.events)
  const setEvents = useNotificationStore((s) => s.setEvents)

  const [financials, setFinancials] = useState(null)
  const [generating, setGenerating] = useState(false)

  const loadData = useCallback(async () => {
    if (!hospitalId) return
    try {
      const [depts, fin, evts] = await Promise.all([
        getDepartments(hospitalId),
        getFinancials(hospitalId, 30),
        getEvents(hospitalId, 20),
      ])
      setDepartments(depts)
      setFinancials(fin)
      setEvents(evts)
    } catch (e) {
      console.error('Dashboard load error', e)
    }
  }, [hospitalId, setDepartments, setEvents])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleGeneratePatient = async () => {
    setGenerating(true)
    try {
      await generatePatient(hospitalId)
      await loadData()
    } catch (e) {
      console.error('Failed to generate patient', e)
    } finally {
      setGenerating(false)
    }
  }

  const budget = stats?.hospital?.budget ?? 0
  const totalBeds = stats?.total_beds ?? 0
  const occupiedBeds = stats?.occupied_beds ?? 0
  const availableBeds = stats?.available_beds ?? 0
  const patientsWaiting = stats?.patients_waiting ?? 0
  const patientsInTreatment = stats?.patients_in_treatment ?? 0
  const staffOnDuty = stats?.staff_on_duty ?? 0
  const erWait = stats?.er_wait_time_estimate ?? 0
  const dailyRevenue = stats?.daily_revenue ?? 0
  const dailyExpenses = stats?.daily_expenses ?? 0

  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time hospital overview</p>
        </div>
        <button
          onClick={handleGeneratePatient}
          disabled={generating}
          className="btn-secondary"
        >
          <UserPlus className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Patient'}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Available Beds"
          value={`${availableBeds}/${totalBeds}`}
          icon={Bed}
          color={availableBeds < 5 ? 'red' : 'green'}
          subtitle={`${occupancyPct}% occupied`}
        />
        <StatCard
          label="Patients Waiting"
          value={patientsWaiting}
          icon={Clock}
          color={patientsWaiting > 10 ? 'red' : patientsWaiting > 5 ? 'yellow' : 'blue'}
          subtitle={`ER wait: ${erWait}m`}
        />
        <StatCard
          label="In Treatment"
          value={patientsInTreatment}
          icon={Activity}
          color="purple"
          subtitle="Active cases"
        />
        <StatCard
          label="Staff On Duty"
          value={staffOnDuty}
          icon={UserCog}
          color="blue"
          subtitle="Available staff"
        />
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Current Budget"
          value={`$${budget.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color={budget < 10000 ? 'red' : budget < 50000 ? 'yellow' : 'green'}
        />
        <StatCard
          label="Recent Revenue"
          value={`$${dailyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          color="green"
          subtitle="Last 50 transactions"
        />
        <StatCard
          label="Recent Expenses"
          value={`$${dailyExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          icon={AlertTriangle}
          color="red"
          subtitle="Last 50 transactions"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart departments={departments} />
        <RevenueChart transactions={financials?.transactions ?? []} />
      </div>

      {/* Events feed */}
      <div>
        <div className="card-header mb-3">Recent Events</div>
        <EventFeed events={events} />
      </div>
    </div>
  )
}