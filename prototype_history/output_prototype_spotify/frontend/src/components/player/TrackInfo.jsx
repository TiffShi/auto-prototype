import React from 'react'
import { Link } from 'react-router-dom'
import { usePlayerStore } from '../../store/playerStore.js'
import { useLibraryStore } from '../../store/libraryStore.js'

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#1DB954' : 'none'} stroke={filled ? '#1DB954' : 'currentColor'} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function TrackInfo() {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const { toggleLikeTrack, isTrackLiked } = useLibraryStore()

  if (!currentTrack) {
    return (
      <div className="flex items-center gap-3 w-56">
        <div className="w-14 h-14 bg-[#282828] rounded flex-shrink-0" />
        <div>
          <p className="text-[#B3B3B3] text-sm">No track playing</p>
        </div>
      </div>
    )
  }

  const liked = isTrackLiked(currentTrack.id)

  return (
    <div className="flex items-center gap-3 w-56 min-w-0">
      <img
        src={currentTrack.cover_url}
        alt={currentTrack.album_title}
        className="w-14 h-14 rounded object-cover flex-shrink-0 shadow-lg"
      />
      <div className="min-w-0 flex-1">
        <Link
          to={`/album/${currentTrack.album_id}`}
          className="text-white text-sm font-medium hover:underline truncate block"
        >
          {currentTrack.title}
        </Link>
        <Link
          to={`/artist/${currentTrack.artist_id}`}
          className="text-[#B3B3B3] text-xs hover:text-white hover:underline truncate block mt-0.5"
        >
          {currentTrack.artist_name}
        </Link>
      </div>
      <button
        onClick={() => toggleLikeTrack(currentTrack)}
        className={`flex-shrink-0 transition-colors ${liked ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
      >
        <HeartIcon filled={liked} />
      </button>
    </div>
  )
}