import { create } from 'zustand'

let audioElement = null

function getAudio() {
  if (!audioElement) {
    audioElement = new Audio()
    audioElement.preload = 'metadata'
  }
  return audioElement
}

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  isShuffled: false,
  repeatMode: 'none', // 'none' | 'all' | 'one'
  volume: 0.8,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,

  // Internal: set up audio listeners
  _initAudio: () => {
    const audio = getAudio()
    const store = get()

    audio.ontimeupdate = () => {
      set({ currentTime: audio.currentTime })
    }

    audio.ondurationchange = () => {
      set({ duration: audio.duration || 0 })
    }

    audio.onended = () => {
      const { repeatMode, queue, queueIndex } = get()
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
        get().next()
      } else {
        set({ isPlaying: false, currentTime: 0 })
      }
    }

    audio.onloadstart = () => set({ isLoading: true })
    audio.oncanplay = () => set({ isLoading: false })
    audio.onerror = () => set({ isLoading: false, isPlaying: false })

    audio.volume = store.volume
  },

  playTrack: (track, queue = null) => {
    const audio = getAudio()
    const { _initAudio, volume, isMuted } = get()

    // Initialize listeners once
    if (!audio.ontimeupdate) {
      _initAudio()
    }

    let newQueue = queue || [track]
    let newIndex = newQueue.findIndex((t) => t.id === track.id)
    if (newIndex === -1) {
      newQueue = [track, ...newQueue]
      newIndex = 0
    }

    audio.src = track.audio_url
    audio.volume = isMuted ? 0 : volume
    audio.currentTime = 0

    audio.play().then(() => {
      set({
        currentTrack: track,
        queue: newQueue,
        queueIndex: newIndex,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      })
    }).catch((err) => {
      console.error('Playback error:', err)
      set({ isPlaying: false })
    })
  },

  togglePlay: () => {
    const audio = getAudio()
    const { isPlaying, currentTrack } = get()

    if (!currentTrack) return

    if (isPlaying) {
      audio.pause()
      set({ isPlaying: false })
    } else {
      audio.play().then(() => set({ isPlaying: true })).catch(() => {})
    }
  },

  pause: () => {
    const audio = getAudio()
    audio.pause()
    set({ isPlaying: false })
  },

  next: () => {
    const { queue, queueIndex, isShuffled, repeatMode } = get()
    if (queue.length === 0) return

    let nextIndex
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0
        } else {
          set({ isPlaying: false })
          return
        }
      }
    }

    const nextTrack = queue[nextIndex]
    const audio = getAudio()
    audio.src = nextTrack.audio_url
    audio.currentTime = 0
    audio.play().then(() => {
      set({
        currentTrack: nextTrack,
        queueIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      })
    }).catch(() => {})
  },

  prev: () => {
    const audio = getAudio()
    const { queue, queueIndex, currentTime } = get()

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      audio.currentTime = 0
      set({ currentTime: 0 })
      return
    }

    if (queue.length === 0) return

    const prevIndex = queueIndex > 0 ? queueIndex - 1 : 0
    const prevTrack = queue[prevIndex]

    audio.src = prevTrack.audio_url
    audio.currentTime = 0
    audio.play().then(() => {
      set({
        currentTrack: prevTrack,
        queueIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      })
    }).catch(() => {})
  },

  seek: (time) => {
    const audio = getAudio()
    audio.currentTime = time
    set({ currentTime: time })
  },

  setVolume: (vol) => {
    const audio = getAudio()
    const clampedVol = Math.max(0, Math.min(1, vol))
    audio.volume = clampedVol
    set({ volume: clampedVol, isMuted: clampedVol === 0 })
  },

  toggleMute: () => {
    const audio = getAudio()
    const { isMuted, volume } = get()
    if (isMuted) {
      audio.volume = volume
      set({ isMuted: false })
    } else {
      audio.volume = 0
      set({ isMuted: true })
    }
  },

  toggleShuffle: () => {
    set((s) => ({ isShuffled: !s.isShuffled }))
  },

  cycleRepeat: () => {
    set((s) => {
      const modes = ['none', 'all', 'one']
      const idx = modes.indexOf(s.repeatMode)
      return { repeatMode: modes[(idx + 1) % modes.length] }
    })
  },

  setQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) return
    const track = tracks[startIndex]
    get().playTrack(track, tracks)
  },

  addToQueue: (track) => {
    set((s) => ({ queue: [...s.queue, track] }))
  },
}))