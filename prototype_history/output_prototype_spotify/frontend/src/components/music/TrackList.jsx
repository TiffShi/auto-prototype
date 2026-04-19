import React from 'react'
import TrackRow from './TrackRow.jsx'

export default function TrackList({ tracks, showAlbum = true, showCover = true }) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="text-center py-12 text-[#B3B3B3]">
        <p>No tracks found</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#282828] mb-2">
        <div className="w-8 text-center text-xs text-[#B3B3B3] uppercase tracking-wider">#</div>
        {showCover && <div className="w-10" />}
        <div className="flex-1 text-xs text-[#B3B3B3] uppercase tracking-wider">Title</div>
        {showAlbum && (
          <div className="hidden md:block w-40 text-xs text-[#B3B3B3] uppercase tracking-wider">Album</div>
        )}
        <div className="w-4" />
        <div className="w-10 text-right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#B3B3B3" className="ml-auto">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
          </svg>
        </div>
        <div className="w-6" />
      </div>

      {/* Tracks */}
      {tracks.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          queue={tracks}
          showAlbum={showAlbum}
          showCover={showCover}
        />
      ))}
    </div>
  )
}