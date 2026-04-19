import React from 'react'
import { usePlayerStore } from '../../store/playerStore.js'

function ShuffleIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? '#1DB954' : 'currentColor'}>
      <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
    </svg>
  )
}

function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}

function RepeatIcon({ mode }) {
  const color = mode !== 'none' ? '#1DB954' : 'currentColor'
  if (mode === 'one') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
    </svg>
  )
}

export default function PlayerControls() {
  const {
    isPlaying,
    isShuffled,
    repeatMode,
    currentTrack,
    togglePlay,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    isLoading,
  } = usePlayerStore()

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleShuffle}
        className={`transition-colors ${isShuffled ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
        title="Shuffle"
      >
        <ShuffleIcon active={isShuffled} />
      </button>

      <button
        onClick={prev}
        disabled={!currentTrack}
        className="text-[#B3B3B3] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Previous"
      >
        <PrevIcon />
      </button>

      <button
        onClick={togglePlay}
        disabled={!currentTrack || isLoading}
        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </button>

      <button
        onClick={next}
        disabled={!currentTrack}
        className="text-[#B3B3B3] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Next"
      >
        <NextIcon />
      </button>

      <button
        onClick={cycleRepeat}
        className={`transition-colors relative ${repeatMode !== 'none' ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
        title={`Repeat: ${repeatMode}`}
      >
        <RepeatIcon mode={repeatMode} />
        {repeatMode !== 'none' && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />
        )}
      </button>
    </div>
  )
}