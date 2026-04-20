import React, { useEffect, useCallback } from 'react'
import { useHospitalStore } from '../../store/hospitalStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useNotificationStore } from '../../store/notificationStore'
import { getHospital } from '../../api/hospitalApi'
import { useWebSocket } from '../../api/websocket'
import SimSpeedControl from './SimSpeedControl'
import { Calendar, Bed, Clock, AlertTriangle } from 'lucide-react'

export default function TopBar() {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  const stats = useHospitalStore((s) => s.stats)
  const setStats = useHospitalStore((s) => s.setStats)
  const setConnected = useSimulationStore((s) => s.setConnected)
  const onTick = useSimulationStore((s) => s.onTick)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const prependEvent = useNotificationStore((s) => s.prependEvent)

  const refreshStats = useCallback(async () => {
    if (!hospitalId) return
    try {
      const data = await getHospital(hospitalId)
      setStats(data)
    } catch (e) {
      console.error('Failed to refresh stats', e)
    }
  }, [hospitalId, setStats])

  const handleWsMessage = useCallback(
    (msg) => {
      if (msg.type === 'CONNECTED') {
        setConnected(true)
      } else if (msg.type === 'TICK_UPDATE') {
        onTick(msg.data)
        refreshStats()

        // Show notifications for critical events
        if (msg.data?.events?.length > 0) {
          msg.data.events.forEach((evt) => {
            if (evt === 'DISEASE_OUTBREAK' || evt === 'MASS_CASUALTY') {
              addNotification(`⚠️ ${evt.replace(/_/g, ' ')}`, 'critical')
            }
          })
        }
        if (msg.data?.deceased > 0) {
          addNotification(`💀 ${msg.data.deceased} patient(s) deceased this tick`, 'critical')
        }
      } else if (msg.type === 'PONG') {
        // ignore
      }
    },
    [setConnected, onTick, refreshStats, addNotification]
  )

  useWebSocket(hospitalId, handleWsMessage)

  useEffect(() => {
    refreshStats()
    const interval = setInterval(refreshStats, 15000)
    return () => clearInterval(interval)
  }, [refreshStats])

  const day = stats?.hospital?.day ?? 1
  const availableBeds = stats?.available_beds ?? 0
  const totalBeds = stats?.total_beds ?? 0
  const patientsWaiting = stats?.patients_waiting ?? 0
  const erWait = stats?.er_wait_time_estimate ?? 0

  return (
    <header className="h-14 bg-navy-800 border-b border-navy-600 flex items-center justify-between px-6 shrink-0">
      {/* Left: Quick stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-medical-blue" />
          <span className="text-gray-400">Day</span>
          <span className="font-bold text-white">{day}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Bed className="w-4 h-4 text-medical-green" />
          <span className="text-gray-400">Beds</span>
          <span className="font-bold text-white">
            {availableBeds}/{totalBeds}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-gray-400">Waiting</span>
          <span className={`font-bold ${patientsWaiting > 10 ? 'text-red-400' : 'text-white'}`}>
            {patientsWaiting}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-gray-400">ER Wait</span>
          <span className="font-bold text-white">{erWait}m</span>
        </div>
      </div>

      {/* Right: Sim speed control */}
      <SimSpeedControl />
    </header>
  )
}