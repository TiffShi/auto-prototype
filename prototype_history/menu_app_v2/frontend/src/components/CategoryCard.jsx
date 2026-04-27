import React, { useState } from 'react';
import {
  Pencil, Trash2, GripVertical, ChevronDown, ChevronUp,
  Plus, Eye, EyeOff,
} from 'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ItemCard from './ItemCard.jsx';

function SortableItemCard({ item, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `item-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item">
      <ItemCard
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

export default function CategoryCard({
  category,
  items,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  dragHandleProps,
  isDragging,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const categoryItems = items
    .filter((i) => i.category_id === category.id)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  const itemIds = categoryItems.map((i) => `item-${i.id}`);

  return (
    <div
      className={`
        card overflow-hidden transition-shadow duration-150
        ${isDragging ? 'shadow-xl opacity-90' : ''}
      `}
    >
      {/* Category header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="drag-handle text-gray-300 hover:text-gray-500 flex-shrink-0"
            aria-label="Drag to reorder category"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        {/* Title + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
            <span className={category.is_published ? 'badge-published' : 'badge-unpublished'}>
              {category.is_published ? (
                <><Eye className="w-3 h-3 mr-1 inline" />Published</>
              ) : (
                <><EyeOff className="w-3 h-3 mr-1 inline" />Hidden</>
              )}
            </span>
            <span className="text-xs text-gray-400">
              {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
            </span>
          </div>
          {category.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{category.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onAddItem(category)}
            className="btn-ghost p-1.5 text-gray-500 hover:text-brand-600"
            aria-label="Add item"
            title="Add item"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditCategory(category)}
            className="btn-ghost p-1.5 text-gray-500 hover:text-brand-600"
            aria-label="Edit category"
            title="Edit category"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteCategory(category)}
            className="btn-ghost p-1.5 text-gray-500 hover:text-red-600"
            aria-label="Delete category"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="btn-ghost p-1.5 text-gray-400"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Items list */}
      {!collapsed && (
        <div className="p-3 space-y-2">
          {categoryItems.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No items yet.</p>
              <button
                onClick={() => onAddItem(category)}
                className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                + Add first item
              </button>
            </div>
          ) : (
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              {categoryItems.map((item) => (
                <SortableItemCard
                  key={item.id}
                  item={item}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
}