import React from 'react'

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className={`${sizes[size]} border-4 border-[#282828] border-t-[#1DB954] rounded-full animate-spin`}
      />
      {text && <p className="text-[#B3B3B3] text-sm">{text}</p>}
    </div>
  )
}