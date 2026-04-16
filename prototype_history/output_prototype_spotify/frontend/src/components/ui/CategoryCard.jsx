import React from 'react'

export default function CategoryCard({ category, onClick }) {
  return (
    <div
      className="relative rounded-lg overflow-hidden cursor-pointer h-24 group"
      style={{ backgroundColor: category.color }}
      onClick={() => onClick?.(category)}
    >
      <div className="absolute inset-0 p-4">
        <h3 className="text-white font-bold text-base">{category.name}</h3>
      </div>
      <img
        src={category.image_url}
        alt={category.name}
        className="absolute bottom-0 right-0 w-16 h-16 object-cover rounded-tl-lg transform rotate-12 translate-x-2 translate-y-2 shadow-lg group-hover:scale-105 transition-transform"
        loading="lazy"
      />
    </div>
  )
}