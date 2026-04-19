import { useCallback } from 'react'
import { usePlayerStore } from '../store/playerStore.js'

export function usePlayer() {
  const store = usePlayerStore()

  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  const progressPercent =
    store.duration > 0 ? (store.currentTime / store.duration) * 100 : 0

  return {
    ...store,
    formatTime,
    progressPercent,
  }
}