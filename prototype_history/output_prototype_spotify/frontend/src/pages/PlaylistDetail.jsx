import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../store/libraryStore.js'
import { usePlayerStore } from '../store/playerStore.js'
import TrackRow from '../components/music/TrackRow.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  )
}

export default function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playlists, updatePlaylist, deletePlaylist, removeTrackFromPlaylist } = useLibraryStore()
  const { setQueue } = usePlayerStore()

  const playlist = playlists.find((p) => p.id === id)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  if (!playlist) {
    return (
      <div className="text-center py-24">
        <p className="text-white text-xl font-bold">Playlist not found</p>
        <button
          onClick={() => navigate('/library')}
          className="mt-4 px-6 py-2 bg-[#1DB954] text-black font-bold rounded-full"
        >
          Back to Library
        </button>
      </div>
    )
  }

  const handleEdit = () => {
    setEditName(playlist.name)
    setEditDesc(playlist.description)
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    await updatePlaylist(id, { name: editName, description: editDesc })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await deletePlaylist(id)
    navigate('/library')
  }

  const handleRemoveTrack = async (trackId) => {
    await removeTrackFromPlaylist(id, trackId)
  }

  const totalDuration = playlist.tracks.reduce((acc, t) => acc + t.duration, 0)
  const formatTotal = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h > 0) return `${h} hr ${m} min`
    return `${m} min`
  }

  return (
    <div>
      {/* Edit modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#282828] rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-white text-2xl font-bold mb-6">Edit playlist details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[#B3B3B3] text-sm mb-1 block">Name</label>
                <input
                  autoFocus
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded-md outline-none border border-transparent focus:border-white placeholder-[#535353]"
                />
              </div>
              <div>
                <label className="text-[#B3B3B3] text-sm mb-1 block">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded-md outline-none border border-transparent focus:border-white placeholder-[#535353] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 text-white font-semibold rounded-full hover:bg-[#3e3e3e] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#282828] rounded-xl p-8 w-full max-w-sm shadow-2xl text-center">
            <h2 className="text-white text-xl font-bold mb-2">Delete playlist?</h2>
            <p className="text-[#B3B3B3] mb-6">
              This will delete <strong className="text-white">{playlist.name}</strong> from your library.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-6 py-2 text-white font-semibold rounded-full border border-[#535353] hover:border-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-[#E91E63] text-white font-bold rounded-full hover:bg-[#c2185b] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end gap-6 mb-8 pb-6 bg-gradient-to-b from-[#3e3e3e] to-transparent -mx-6 px-6 pt-6">
        <img
          src={playlist.cover_url}
          alt={playlist.name}
          className="w-48 h-48 rounded-lg shadow-2xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs uppercase tracking-widest font-semibold mb-2">Playlist</p>
          <h1 className="text-white text-4xl font-bold mb-2 truncate">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-[#B3B3B3] text-sm mb-3">{playlist.description}</p>
          )}
          <p className="text-[#B3B3B3] text-sm">
            {playlist.tracks.length} songs
            {playlist.tracks.length > 0 && ` • ${formatTotal(totalDuration)}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-6">
        {playlist.tracks.length > 0 && (
          <button
            onClick={() => setQueue(playlist.tracks, 0)}
            className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:bg-[#1ed760] hover:scale-105 transition-all shadow-lg"
          >
            <PlayIcon />
          </button>
        )}
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 text-[#B3B3B3] hover:text-white transition-colors px-3 py-2 rounded-full border border-[#535353] hover:border-white text-sm"
        >
          <EditIcon />
          Edit
        </button>
        <button
          onClick={() => setIsDeleting(true)}
          className="flex items-center gap-2 text-[#B3B3B3] hover:text-[#E91E63] transition-colors px-3 py-2 rounded-full border border-[#535353] hover:border-[#E91E63] text-sm"
        >
          <TrashIcon />
          Delete
        </button>
      </div>

      {/* Track list */}
      {playlist.tracks.length === 0 ? (
        <div className="text-center py-16 bg-[#181818] rounded-lg">
          <p className="text-white text-lg font-bold mb-2">Let's find something for your playlist</p>
          <p className="text-[#B3B3B3] text-sm">
            Search for songs and add them using the ⋮ menu on any track
          </p>
        </div>
      ) : (
        <div className="bg-[#181818] rounded-lg overflow-hidden">
          {playlist.tracks.map((track, i) => (
            <div key={track.id} className="group relative">
              <TrackRow
                track={track}
                index={i}
                queue={playlist.tracks}
                showAlbum={true}
                showCover={true}
              />
              <button
                onClick={() => handleRemoveTrack(track.id)}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-transparent group-hover:text-[#B3B3B3] hover:!text-[#E91E63] transition-colors text-xs font-semibold"
                title="Remove from playlist"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}