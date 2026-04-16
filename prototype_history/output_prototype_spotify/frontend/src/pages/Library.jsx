import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../store/libraryStore.js'
import { usePlayerStore } from '../store/playerStore.js'
import PlaylistCard from '../components/music/PlaylistCard.jsx'
import TrackRow from '../components/music/TrackRow.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 11V3h2v8h8v2h-8v8h-2v-8H3v-2z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function Library() {
  const navigate = useNavigate()
  const { playlists, likedTracks, createPlaylist, isLoading } = useLibraryStore()
  const { setQueue } = usePlayerStore()
  const [activeTab, setActiveTab] = useState('playlists')
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = async () => {
    const name = newName.trim() || `My Playlist #${playlists.length + 1}`
    const pl = await createPlaylist({ name, description: '' })
    setIsCreating(false)
    setNewName('')
    navigate(`/playlist/${pl.id}`)
  }

  if (isLoading) return <LoadingSpinner text="Loading library..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-3xl font-bold">Your Library</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-transparent border border-[#535353] text-white px-4 py-2 rounded-full text-sm font-semibold hover:border-white transition-colors"
        >
          <PlusIcon />
          New Playlist
        </button>
      </div>

      {/* Create playlist modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#282828] rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-white text-2xl font-bold mb-6">Create playlist</h2>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') { setIsCreating(false); setNewName('') }
              }}
              placeholder="My Playlist #1"
              className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded-md outline-none border border-transparent focus:border-white mb-6 placeholder-[#535353]"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIsCreating(false); setNewName('') }}
                className="px-6 py-2 text-white font-semibold rounded-full hover:bg-[#3e3e3e] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {['playlists', 'liked'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'bg-[#282828] text-white hover:bg-[#3e3e3e]'
            }`}
          >
            {tab === 'playlists' ? 'Playlists' : 'Liked Songs'}
          </button>
        ))}
      </div>

      {/* Playlists tab */}
      {activeTab === 'playlists' && (
        <div>
          {playlists.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white text-xl font-bold mb-2">Create your first playlist</p>
              <p className="text-[#B3B3B3] mb-6">It's easy, we'll help you</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                Create playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.map((pl) => (
                <PlaylistCard key={pl.id} playlist={pl} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Liked songs tab */}
      {activeTab === 'liked' && (
        <div>
          {likedTracks.length === 0 ? (
            <div className="text-center py-16">
              <HeartIcon />
              <p className="text-white text-xl font-bold mt-4 mb-2">Songs you like will appear here</p>
              <p className="text-[#B3B3B3]">Save songs by tapping the heart icon</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-48 h-48 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-lg flex items-center justify-center">
                  <HeartIcon />
                </div>
                <div>
                  <p className="text-[#B3B3B3] text-sm uppercase tracking-wider">Playlist</p>
                  <h2 className="text-white text-4xl font-bold mt-1">Liked Songs</h2>
                  <p className="text-[#B3B3B3] mt-2">{likedTracks.length} songs</p>
                  <button
                    onClick={() => setQueue(likedTracks, 0)}
                    className="mt-4 px-8 py-3 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#1ed760] transition-colors"
                  >
                    Play
                  </button>
                </div>
              </div>
              <div className="bg-[#181818] rounded-lg overflow-hidden">
                {likedTracks.map((track, i) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={i}
                    queue={likedTracks}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}