import React from 'react'

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#B3B3B3]">
      <path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 11.166C1.126 18.61 5.353 23.537 10.533 23.537c2.507 0 4.787-1.203 6.496-3.168l3.548 3.548a1 1 0 1 0 1.414-1.414l-3.548-3.548c1.965-1.71 3.168-3.99 3.168-6.496 0-6.24-4.226-11.18-9.078-11.18zm-7.407 11.166c0-5.065 3.426-9.166 7.407-9.166s7.078 4.1 7.078 9.166-3.097 9.166-7.078 9.166-7.407-4.1-7.407-9.166z" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search...' }) {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white text-black placeholder-[#535353] rounded-full py-3 pl-10 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-white"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 text-[#535353] hover:text-black transition-colors"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  )
}