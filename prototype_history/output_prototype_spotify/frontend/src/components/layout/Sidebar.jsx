import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../../store/libraryStore.js'

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 11.166C1.126 18.61 5.353 23.537 10.533 23.537c2.507 0 4.787-1.203 6.496-3.168l3.548 3.548a1 1 0 1 0 1.414-1.414l-3.548-3.548c1.965-1.71 3.168-3.99 3.168-6.496 0-6.24-4.226-11.18-9.078-11.18zm-7.407 11.166c0-5.065 3.426-9.166 7.407-9.166s7.078 4.1 7.078 9.166-3.097 9.166-7.078 9.166-7.407-4.1-7.407-9.166z" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1.5.866l7-4a1 1 0 0 0 0-1.732l-7-4zM8 20V4l8 4.5L8 20z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 11V3h2v8h8v2h-8v8h-2v-8H3v-2z" />
    </svg>
  )
}

function MusicNoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { playlists, createPlaylist } = useLibraryStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-150 ${
      isActive
        ? 'text-white'
        : 'text-[#B3B3B3] hover:text-white'
    }`

  const handleCreatePlaylist = async () => {
    if (!newName.trim()) {
      const name = `My Playlist #${playlists.length + 1}`
      await createPlaylist({ name, description: '' })
    } else {
      await createPlaylist({ name: newName.trim(), description: '' })
    }
    setIsCreating(false)
    setNewName('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreatePlaylist()
    if (e.key === 'Escape') {
      setIsCreating(false)
      setNewName('')
    }
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-black h-full">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Streamify</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="px-3 mb-6">
        <NavLink to="/" end className={navLinkClass}>
          <HomeIcon />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={navLinkClass}>
          <SearchIcon />
          <span>Search</span>
        </NavLink>
        <NavLink to="/library" className={navLinkClass}>
          <LibraryIcon />
          <span>Your Library</span>
        </NavLink>
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-[#282828] mb-4" />

      {/* Playlists Section */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[#B3B3B3] text-xs font-semibold uppercase tracking-widest">
            Playlists
          </span>
          <button
            onClick={() => setIsCreating(true)}
            className="text-[#B3B3B3] hover:text-white transition-colors p-1 rounded"
            title="Create playlist"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Create playlist inline */}
        {isCreating && (
          <div className="mb-2 px-1">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCreatePlaylist}
              placeholder="Playlist name..."
              className="w-full bg-[#282828] text-white text-sm px-3 py-2 rounded outline-none border border-[#1DB954] placeholder-[#535353]"
            />
          </div>
        )}

        {/* Playlist list */}
        <div className="space-y-1">
          {playlists.map((playlist) => (
            <NavLink
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors duration-150 ${
                  isActive
                    ? 'text-white bg-[#282828]'
                    : 'text-[#B3B3B3] hover:text-white hover:bg-[#1a1a1a]'
                }`
              }
            >
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-[#282828] flex items-center justify-center">
                {playlist.cover_url ? (
                  <img
                    src={playlist.cover_url}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MusicNoteIcon />
                )}
              </div>
              <span className="truncate">{playlist.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  )
}