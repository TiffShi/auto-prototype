import React from 'react'
import TrackInfo from './TrackInfo.jsx'
import PlayerControls from './PlayerControls.jsx'
import ProgressBar from './ProgressBar.jsx'
import VolumeControl from './VolumeControl.jsx'

export default function PlayerBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] flex items-center px-4 z-50"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      {/* Track info - left */}
      <div className="flex-1 flex items-center">
        <TrackInfo />
      </div>

      {/* Controls + progress - center */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-xl">
        <PlayerControls />
        <ProgressBar />
      </div>

      {/* Volume - right */}
      <div className="flex-1 flex items-center justify-end">
        <VolumeControl />
      </div>
    </div>
  )
}