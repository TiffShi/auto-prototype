import React, { useRef, useCallback } from 'react'
import { usePlayerStore } from '../../store/playerStore.js'
import { usePlayer } from '../../hooks/usePlayer.js'

export default function ProgressBar() {
  const { currentTime, duration, seek } = usePlayerStore()
  const { formatTime } = usePlayer()
  const barRef = useRef(null)

  const handleChange = useCallback(
    (e) => {
      const val = parseFloat(e.target.value)
      seek(val)
    },
    [seek]
  )

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <span className="text-[#B3B3B3] text-xs w-10 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>

      <div className="relative flex-1 group" ref={barRef}>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={currentTime}
          onChange={handleChange}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1DB954 ${progressPercent}%, #535353 ${progressPercent}%)`,
          }}
        />
      </div>

      <span className="text-[#B3B3B3] text-xs w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  )
}