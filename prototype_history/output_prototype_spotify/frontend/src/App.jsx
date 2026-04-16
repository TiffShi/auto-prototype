import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Library from './pages/Library.jsx'
import PlaylistDetail from './pages/PlaylistDetail.jsx'
import AlbumDetail from './pages/AlbumDetail.jsx'
import ArtistDetail from './pages/ArtistDetail.jsx'
import { useLibraryStore } from './store/libraryStore.js'

function App() {
  const fetchPlaylists = useLibraryStore((s) => s.fetchPlaylists)

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="library" element={<Library />} />
        <Route path="playlist/:id" element={<PlaylistDetail />} />
        <Route path="album/:id" element={<AlbumDetail />} />
        <Route path="artist/:id" element={<ArtistDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App