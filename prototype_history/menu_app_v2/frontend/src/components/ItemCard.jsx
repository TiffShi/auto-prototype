import React from 'react';
import { Pencil, Trash2, GripVertical, ImageOff } from 'lucide-react';

export default function ItemCard({ item, onEdit, onDelete, dragHandleProps, isDragging }) {
  return (
    <div
      className={`
        flex items-center gap-3 p-3 bg-white rounded-lg border
        transition-shadow duration-150
        ${isDragging ? 'shadow-lg border-brand-300 opacity-90' : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      {/* Drag handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="drag-handle text-gray-300 hover:text-gray-500 flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Image */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm truncate">{item.name}</span>
          <span className={item.is_available ? 'badge-available' : 'badge-unavailable'}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
        )}
        <p className="text-sm font-semibold text-brand-600 mt-0.5">
          ${Number(item.price).toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="btn-ghost p-1.5 text-gray-500 hover:text-brand-600"
          aria-label={`Edit ${item.name}`}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="btn-ghost p-1.5 text-gray-500 hover:text-red-600"
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}