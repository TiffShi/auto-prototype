import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../../store/playerStore.js'

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export default function PlaylistCard({ playlist }) {
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()

  const handlePlay = (e) => {
    e.stopPropagation()
    if (playlist.tracks?.length > 0) {
      setQueue(playlist.tracks, 0)
    }
  }

  return (
    <div
      className="bg-[#181818] rounded-lg p-4 cursor-pointer hover:bg-[#282828] transition-colors group relative"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="relative mb-4">
        <img
          src={playlist.cover_url}
          alt={playlist.name}
          className="w-full aspect-square object-cover rounded-md shadow-lg"
          loading="lazy"
        />
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200"
        >
          <PlayIcon />
        </button>
      </div>
      <h3 className="text-white font-semibold text-sm truncate">{playlist.name}</h3>
      <p className="text-[#B3B3B3] text-xs mt-1 line-clamp-2">
        {playlist.description || `${playlist.tracks?.length || 0} tracks`}
      </p>
    </div>
  )
}