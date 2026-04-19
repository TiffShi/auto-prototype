import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch.js'
import { getCategories } from '../api/client.js'
import SearchBar from '../components/ui/SearchBar.jsx'
import TrackList from '../components/music/TrackList.jsx'
import AlbumCard from '../components/music/AlbumCard.jsx'
import ArtistCard from '../components/music/ArtistCard.jsx'
import PlaylistCard from '../components/music/PlaylistCard.jsx'
import CategoryCard from '../components/ui/CategoryCard.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

export default function Search() {
  const { query, setQuery, results, isLoading, clearSearch } = useSearch()
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  React.useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {})
  }, [])

  const hasResults = results && (
    results.tracks.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0 ||
    results.playlists.length > 0
  )

  return (
    <div className="space-y-6">
      <h1 className="text-white text-3xl font-bold">Search</h1>

      {/* Search input */}
      <div className="max-w-lg">
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={clearSearch}
          placeholder="What do you want to listen to?"
        />
      </div>

      {/* Loading */}
      {isLoading && <LoadingSpinner size="sm" text="Searching..." />}

      {/* Results */}
      {!isLoading && results && (
        <div className="space-y-8">
          {!hasResults && (
            <div className="text-center py-12">
              <p className="text-white text-xl font-bold">No results found</p>
              <p className="text-[#B3B3B3] mt-2">
                Try different keywords or check your spelling
              </p>
            </div>
          )}

          {results.tracks.length > 0 && (
            <section>
              <SectionHeader title="Songs" />
              <div className="bg-[#181818] rounded-lg overflow-hidden">
                <TrackList tracks={results.tracks.slice(0, 10)} />
              </div>
            </section>
          )}

          {results.artists.length > 0 && (
            <section>
              <SectionHeader title="Artists" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {results.albums.length > 0 && (
            <section>
              <SectionHeader title="Albums" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          {results.playlists.length > 0 && (
            <section>
              <SectionHeader title="Playlists" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.playlists.map((pl) => (
                  <PlaylistCard key={pl.id} playlist={pl} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Browse categories when no query */}
      {!query && categories.length > 0 && (
        <section>
          <SectionHeader title="Browse all" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}