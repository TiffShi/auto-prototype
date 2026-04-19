import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtist } from '../api/client.js'
import { usePlayerStore } from '../store/playerStore.js'
import AlbumCard from '../components/music/AlbumCard.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export default function ArtistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { playTrack } = usePlayerStore()

  useEffect(() => {
    setLoading(true)
    getArtist(id)
      .then((res) => setArtist(res.data))
      .catch(() => setError('Artist not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner text="Loading artist..." />
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

  return (
    <div>
      {/* Hero */}
      <div className="relative -mx-6 -mt-0 mb-8 h-64 overflow-hidden">
        <img
          src={artist.image_url}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-[#1DB954] rounded-full flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span className="text-white text-xs font-semibold">Verified Artist</span>
          </div>
          <h1 className="text-white text-5xl font-bold">{artist.name}</h1>
        </div>
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {artist.genres?.map((genre) => (
          <span
            key={genre}
            className="px-3 py-1 bg-[#282828] text-[#B3B3B3] text-xs rounded-full"
          >
            {genre}
          </span>
        ))}
      </div>

      {/* Bio */}
      {artist.bio && (
        <div className="mb-8">
          <SectionHeader title="About" />
          <p className="text-[#B3B3B3] text-sm leading-relaxed max-w-2xl">{artist.bio}</p>
        </div>
      )}

      {/* Albums */}
      {artist.albums?.length > 0 && (
        <section>
          <SectionHeader title="Discography" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}