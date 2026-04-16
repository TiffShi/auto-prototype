import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import PlayerBar from '../player/PlayerBar.jsx'

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#121212] overflow-hidden">
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden" style={{ paddingBottom: '90px' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#121212]">
          <TopBar />
          <main className="flex-1 overflow-y-auto px-6 pb-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Player bar - fixed at bottom */}
      <PlayerBar />
    </div>
  )
}