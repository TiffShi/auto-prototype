import React, { useState } from 'react'
import { usePlayerStore } from '../../store/playerStore.js'
import { useLibraryStore } from '../../store/libraryStore.js'

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#1DB954' : 'none'} stroke={filled ? '#1DB954' : 'currentColor'} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  )
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TrackRow({
  track,
  index,
  queue,
  showAlbum = true,
  showCover = true,
  onAddToPlaylist,
}) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore()
  const { toggleLikeTrack, isTrackLiked, playlists, addTrackToPlaylist } = useLibraryStore()

  const isCurrentTrack = currentTrack?.id === track.id
  const liked = isTrackLiked(track.id)

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay()
    } else {
      playTrack(track, queue || [track])
    }
  }

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addTrackToPlaylist(playlistId, track.id)
      setMenuOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-2 rounded-md transition-colors cursor-pointer ${
        isCurrentTrack ? 'bg-[#282828]' : 'hover:bg-[#282828]'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      onDoubleClick={handlePlay}
    >
      {/* Index / Play button */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        {hovered ? (
          <button onClick={handlePlay} className="text-white">
            {isCurrentTrack && isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        ) : (
          <span className={`text-sm tabular-nums ${isCurrentTrack ? 'text-[#1DB954]' : 'text-[#B3B3B3]'}`}>
            {isCurrentTrack && isPlaying ? (
              <span className="text-[#1DB954] text-xs">♪</span>
            ) : (
              index + 1
            )}
          </span>
        )}
      </div>

      {/* Cover */}
      {showCover && (
        <img
          src={track.cover_url}
          alt={track.album_title}
          className="w-10 h-10 rounded object-cover flex-shrink-0"
        />
      )}

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-[#1DB954]' : 'text-white'}`}>
          {track.title}
        </p>
        <p className="text-xs text-[#B3B3B3] truncate">{track.artist_name}</p>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="hidden md:block w-40 min-w-0">
          <p className="text-sm text-[#B3B3B3] truncate">{track.album_title}</p>
        </div>
      )}

      {/* Like button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLikeTrack(track) }}
        className={`transition-colors ${liked ? 'text-[#1DB954]' : 'text-transparent group-hover:text-[#B3B3B3] hover:!text-white'}`}
      >
        <HeartIcon filled={liked} />
      </button>

      {/* Duration */}
      <span className="text-sm text-[#B3B3B3] w-10 text-right tabular-nums">
        {formatDuration(track.duration)}
      </span>

      {/* More options */}
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
          className="text-transparent group-hover:text-[#B3B3B3] hover:!text-white transition-colors"
        >
          <DotsIcon />
        </button>

        {menuOpen && (
          <div className="absolute right-0 bottom-full mb-1 w-48 bg-[#282828] rounded-md shadow-xl z-50 py-1 border border-[#3e3e3e]">
            <button
              onClick={() => { toggleLikeTrack(track); setMenuOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3e3e3e] transition-colors"
            >
              {liked ? 'Remove from Liked' : 'Add to Liked Songs'}
            </button>
            <div className="border-t border-[#3e3e3e] my-1" />
            <p className="px-4 py-1 text-xs text-[#B3B3B3] uppercase tracking-wider">Add to playlist</p>
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id)}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3e3e3e] transition-colors truncate"
              >
                {pl.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}