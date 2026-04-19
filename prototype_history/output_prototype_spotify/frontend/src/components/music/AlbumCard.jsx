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

export default function AlbumCard({ album }) {
  const navigate = useNavigate()
  const { playTrack } = usePlayerStore()

  const handleClick = () => navigate(`/album/${album.id}`)

  return (
    <div
      className="bg-[#181818] rounded-lg p-4 cursor-pointer hover:bg-[#282828] transition-colors group relative"
      onClick={handleClick}
    >
      <div className="relative mb-4">
        <img
          src={album.cover_url}
          alt={album.title}
          className="w-full aspect-square object-cover rounded-md shadow-lg"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.stopPropagation()
            // Navigate to album to play
            navigate(`/album/${album.id}`)
          }}
          className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200"
        >
          <PlayIcon />
        </button>
      </div>
      <h3 className="text-white font-semibold text-sm truncate">{album.title}</h3>
      <p className="text-[#B3B3B3] text-xs mt-1 truncate">
        {album.release_year} • {album.artist_name}
      </p>
    </div>
  )
}