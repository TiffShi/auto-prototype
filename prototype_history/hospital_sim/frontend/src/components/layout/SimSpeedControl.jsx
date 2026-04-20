import React, { useState } from 'react'
import { Pause, Play, Zap } from 'lucide-react'
import { useHospitalStore } from '../../store/hospitalStore'
import { useSimulationStore } from '../../store/simulationStore'
import { setSimSpeed, manualTick } from '../../api/hospitalApi'
import clsx from 'clsx'

const SPEEDS = [
  { label: '1x', value: 1.0 },
  { label: '2x', value: 2.0 },
  { label: '5x', value: 5.0 },
]

export default function SimSpeedControl() {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  const speed = useSimulationStore((s) => s.speed)
  const isPaused = useSimulationStore((s) => s.isPaused)
  const setSpeed = useSimulationStore((s) => s.setSpeed)
  const setPaused = useSimulationStore((s) => s.setPaused)
  const tickCount = useSimulationStore((s) => s.tickCount)
  const [loading, setLoading] = useState(false)

  const handleSpeedChange = async (newSpeed) => {
    if (!hospitalId) return
    setLoading(true)
    try {
      await setSimSpeed(hospitalId, newSpeed, isPaused)
      setSpeed(newSpeed)
    } catch (e) {
      console.error('Failed to set speed', e)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseToggle = async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      const newPaused = !isPaused
      await setSimSpeed(hospitalId, speed, newPaused)
      setPaused(newPaused)
    } catch (e) {
      console.error('Failed to toggle pause', e)
    } finally {
      setLoading(false)
    }
  }

  const handleManualTick = async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      await manualTick(hospitalId)
    } catch (e) {
      console.error('Failed to manual tick', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Tick counter */}
      <div className="text-xs text-gray-500 font-mono">
        Tick #{tickCount}
      </div>

      {/* Manual tick */}
      <button
        onClick={handleManualTick}
        disabled={loading}
        className="btn-secondary text-xs px-2 py-1"
        title="Manual tick"
      >
        <Zap className="w-3 h-3" />
        Tick
      </button>

      {/* Speed buttons */}
      <div className="flex items-center bg-navy-700 rounded-lg p-0.5 border border-navy-500">
        {SPEEDS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleSpeedChange(value)}
            disabled={loading || isPaused}
            className={clsx(
              'px-3 py-1 text-xs font-semibold rounded-md transition-all',
              speed === value && !isPaused
                ? 'bg-medical-green text-navy-900'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pause/Play */}
      <button
        onClick={handlePauseToggle}
        disabled={loading}
        className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
          isPaused
            ? 'bg-medical-green text-navy-900 hover:bg-medical-green-dark'
            : 'bg-navy-600 text-gray-300 hover:bg-navy-500 border border-navy-500'
        )}
      >
        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </button>
    </div>
  )
}