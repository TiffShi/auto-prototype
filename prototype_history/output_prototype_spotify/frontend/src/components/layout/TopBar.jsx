import React from 'react'
import { useNavigate } from 'react-router-dom'

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

export default function TopBar() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-transparent">
      {/* Navigation arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-black/40 hover:bg-black/60 transition-colors rounded-full pl-1 pr-3 py-1">
          <div className="w-7 h-7 rounded-full bg-[#535353] flex items-center justify-center">
            <UserIcon />
          </div>
          <span className="text-white text-sm font-semibold">Guest</span>
        </button>
      </div>
    </div>
  )
}