import React from 'react'
import { Link } from 'react-router-dom'

export default function SectionHeader({ title, linkTo, linkText = 'Show all' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white font-bold text-xl">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-[#B3B3B3] text-sm font-semibold hover:text-white transition-colors uppercase tracking-wider"
        >
          {linkText}
        </Link>
      )}
    </div>
  )
}