import { create } from 'zustand'
import {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
} from '../api/client.js'

export const useLibraryStore = create((set, get) => ({
  playlists: [],
  likedTracks: [],
  isLoading: false,
  error: null,

  fetchPlaylists: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await getPlaylists()
      set({ playlists: res.data, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  createPlaylist: async (data) => {
    try {
      const res = await createPlaylist(data)
      set((s) => ({ playlists: [...s.playlists, res.data] }))
      return res.data
    } catch (err) {
      console.error('Failed to create playlist:', err)
      throw err
    }
  },

  updatePlaylist: async (id, data) => {
    try {
      const res = await updatePlaylist(id, data)
      set((s) => ({
        playlists: s.playlists.map((p) => (p.id === id ? res.data : p)),
      }))
      return res.data
    } catch (err) {
      console.error('Failed to update playlist:', err)
      throw err
    }
  },

  deletePlaylist: async (id) => {
    try {
      await deletePlaylist(id)
      set((s) => ({
        playlists: s.playlists.filter((p) => p.id !== id),
      }))
    } catch (err) {
      console.error('Failed to delete playlist:', err)
      throw err
    }
  },

  addTrackToPlaylist: async (playlistId, trackId) => {
    try {
      const res = await addTrackToPlaylist(playlistId, trackId)
      set((s) => ({
        playlists: s.playlists.map((p) => (p.id === playlistId ? res.data : p)),
      }))
      return res.data
    } catch (err) {
      console.error('Failed to add track:', err)
      throw err
    }
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    try {
      const res = await removeTrackFromPlaylist(playlistId, trackId)
      set((s) => ({
        playlists: s.playlists.map((p) => (p.id === playlistId ? res.data : p)),
      }))
      return res.data
    } catch (err) {
      console.error('Failed to remove track:', err)
      throw err
    }
  },

  toggleLikeTrack: (track) => {
    set((s) => {
      const isLiked = s.likedTracks.some((t) => t.id === track.id)
      return {
        likedTracks: isLiked
          ? s.likedTracks.filter((t) => t.id !== track.id)
          : [...s.likedTracks, track],
      }
    })
  },

  isTrackLiked: (trackId) => {
    return get().likedTracks.some((t) => t.id === trackId)
  },
}))