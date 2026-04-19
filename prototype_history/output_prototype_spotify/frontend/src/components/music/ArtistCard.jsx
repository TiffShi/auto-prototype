import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ArtistCard({ artist }) {
  const navigate = useNavigate()

  return (
    <div
      className="bg-[#181818] rounded-lg p-4 cursor-pointer hover:bg-[#282828] transition-colors group"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <div className="relative mb-4">
        <img
          src={artist.image_url}
          alt={artist.name}
          className="w-full aspect-square object-cover rounded-full shadow-lg"
          loading="lazy"
        />
      </div>
      <h3 className="text-white font-semibold text-sm truncate">{artist.name}</h3>
      <p className="text-[#B3B3B3] text-xs mt-1 truncate">
        {artist.genres?.slice(0, 2).join(', ')}
      </p>
    </div>
  )
}