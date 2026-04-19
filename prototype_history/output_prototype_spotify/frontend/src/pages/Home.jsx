import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFeatured } from '../api/client.js'
import { usePlayerStore } from '../store/playerStore.js'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import AlbumCard from '../components/music/AlbumCard.jsx'
import ArtistCard from '../components/music/ArtistCard.jsx'
import CategoryCard from '../components/ui/CategoryCard.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import TrackRow from '../components/music/TrackRow.jsx'

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export default function Home() {
  const [featured, setFeatured] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { playTrack, setQueue } = usePlayerStore()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFeatured()
        setFeatured(res.data)
      } catch (err) {
        setError('Failed to load content. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return <LoadingSpinner text="Loading your music..." />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-6xl">🎵</div>
        <p className="text-white text-xl font-bold">Connection Error</p>
        <p className="text-[#B3B3B3] text-sm text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#1ed760] transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const { featured_tracks, new_releases, featured_artists, categories } = featured

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-white text-3xl font-bold mb-6">{getGreeting()}</h1>

        {/* Quick picks grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {featured_tracks.slice(0, 6).map((track) => (
            <button
              key={track.id}
              onClick={() => playTrack(track, featured_tracks)}
              className="flex items-center gap-3 bg-[#282828] hover:bg-[#3e3e3e] rounded-md overflow-hidden transition-colors group"
            >
              <img
                src={track.cover_url}
                alt={track.title}
                className="w-16 h-16 object-cover flex-shrink-0"
              />
              <span className="text-white font-semibold text-sm truncate pr-2">
                {track.title}
              </span>
              <div className="ml-auto mr-3 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <PlayIcon />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Tracks */}
      <section>
        <SectionHeader title="Featured Tracks" />
        <div className="bg-[#181818] rounded-lg overflow-hidden">
          {featured_tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              queue={featured_tracks}
              showAlbum={true}
              showCover={true}
            />
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section>
        <SectionHeader title="New Releases" linkTo="/search" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {new_releases.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      {/* Featured Artists */}
      <section>
        <SectionHeader title="Featured Artists" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {featured_artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {/* Browse Categories */}
      <section>
        <SectionHeader title="Browse Categories" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    </div>
  )
}