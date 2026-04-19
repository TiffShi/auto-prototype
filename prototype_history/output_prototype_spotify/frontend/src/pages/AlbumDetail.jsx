import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getAlbum } from '../api/client.js'
import { usePlayerStore } from '../store/playerStore.js'
import TrackRow from '../components/music/TrackRow.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
    </svg>
  )
}

export default function AlbumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { setQueue, toggleShuffle, isShuffled } = usePlayerStore()

  useEffect(() => {
    setLoading(true)
    getAlbum(id)
      .then((res) => setAlbum(res.data))
      .catch(() => setError('Album not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner text="Loading album..." />
  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-white text-xl font-bold">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#1DB954] text-black font-bold rounded-full">
          Go Back
        </button>
      </div>
    )
  }

  const totalDuration = album.tracks.reduce((acc, t) => acc + t.duration, 0)
  const formatTotal = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h > 0) return `${h} hr ${m} min`
    return `${m} min`
  }

  // Generate a gradient color based on album id
  const gradientColors = {
    'album-1': '#1a472a',
    'album-2': '#1a1a4e',
    'album-3': '#4e1a1a',
    'album-4': '#2d1a4e',
    'album-5': '#4e2d1a',
    'album-6': '#1a2d4e',
    'album-7': '#1a3d4e',
    'album-8': '#3d1a4e',
  }
  const bgColor = gradientColors[id] || '#282828'

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-end gap-6 mb-8 pb-6 -mx-6 px-6 pt-6"
        style={{ background: `linear-gradient(to bottom, ${bgColor}, transparent)` }}
      >
        <img
          src={album.cover_url}
          alt={album.title}
          className="w-48 h-48 rounded-lg shadow-2xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs uppercase tracking-widest font-semibold mb-2">Album</p>
          <h1 className="text-white text-4xl font-bold mb-2">{album.title}</h1>
          <div className="flex items-center gap-2 text-sm text-[#B3B3B3]">
            <Link
              to={`/artist/${album.artist_id}`}
              className="text-white font-semibold hover:underline"
            >
              {album.artist_name}
            </Link>
            <span>•</span>
            <span>{album.release_year}</span>
            <span>•</span>
            <span>{album.tracks.length} songs</span>
            <span>•</span>
            <span>{formatTotal(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setQueue(album.tracks, 0)}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:bg-[#1ed760] hover:scale-105 transition-all shadow-lg"
        >
          <PlayIcon />
        </button>
        <button
          onClick={toggleShuffle}
          className={`p-3 rounded-full transition-colors ${
            isShuffled ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'
          }`}
          title="Shuffle"
        >
          <ShuffleIcon />
        </button>
      </div>

      {/* Track list */}
      <div className="bg-[#181818] rounded-lg overflow-hidden">
        {album.tracks.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            queue={album.tracks}
            showAlbum={false}
            showCover={false}
          />
        ))}
      </div>

      {/* Album info */}
      <div className="mt-8 text-[#B3B3B3] text-sm">
        <p className="font-semibold text-white">{album.release_year}</p>
        <p className="mt-1">{album.genre}</p>
      </div>
    </div>
  )
}