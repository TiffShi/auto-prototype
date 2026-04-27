import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, Loader2, RefreshCw, LayoutDashboard } from 'lucide-react';

import Navbar from '../components/Navbar.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import CategoryForm from '../components/CategoryForm.jsx';
import ItemForm from '../components/ItemForm.jsx';

import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from '../api/categoryApi.js';
import { getItems, createItem, updateItem, deleteItem, uploadItemImage, reorderItems } from '../api/itemApi.js';

// Sortable wrapper for CategoryCard
function SortableCategoryCard(props) {
  const { category } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `cat-${category.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item">
      <CategoryCard
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modal state
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catFormLoading, setCatFormLoading] = useState(false);

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState(null);
  const [itemFormLoading, setItemFormLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category'|'item', data }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // DnD active id
  const [activeDragId, setActiveDragId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [cats, itms] = await Promise.all([getCategories(), getItems()]);
      setCategories(cats);
      setItems(itms);
    } catch {
      toast.error('Failed to load menu data.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Category CRUD ──────────────────────────────────────────────────────────
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatFormOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatFormOpen(true);
  };

  const handleCategorySubmit = async (data) => {
    setCatFormLoading(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, data);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('Category updated!');
      } else {
        const created = await createCategory({ ...data, sort_order: categories.length });
        setCategories((prev) => [...prev, created]);
        toast.success('Category created!');
      }
      setCatFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save category.');
    } finally {
      setCatFormLoading(false);
    }
  };

  // ── Item CRUD ──────────────────────────────────────────────────────────────
  const handleOpenAddItem = (category) => {
    setEditingItem(null);
    setDefaultCategoryId(category.id);
    setItemFormOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setDefaultCategoryId(item.category_id);
    setItemFormOpen(true);
  };

  const handleItemSubmit = async (data, imageFile) => {
    setItemFormLoading(true);
    try {
      let savedItem;
      if (editingItem) {
        savedItem = await updateItem(editingItem.id, data);
        setItems((prev) => prev.map((i) => (i.id === savedItem.id ? savedItem : i)));
        toast.success('Item updated!');
      } else {
        savedItem = await createItem({ ...data, sort_order: items.filter(i => i.category_id === data.category_id).length });
        setItems((prev) => [...prev, savedItem]);
        toast.success('Item created!');
      }

      // Upload image if selected
      if (imageFile) {
        try {
          const withImage = await uploadItemImage(savedItem.id, imageFile);
          setItems((prev) => prev.map((i) => (i.id === withImage.id ? withImage : i)));
        } catch {
          toast.error('Item saved, but image upload failed.');
        }
      }

      setItemFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save item.');
    } finally {
      setItemFormLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteCategory = (cat) => setDeleteTarget({ type: 'category', data: cat });
  const handleDeleteItem = (item) => setDeleteTarget({ type: 'item', data: item });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'category') {
        await deleteCategory(deleteTarget.data.id);
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.data.id));
        setItems((prev) => prev.filter((i) => i.category_id !== deleteTarget.data.id));
        toast.success('Category deleted.');
      } else {
        await deleteItem(deleteTarget.data.id);
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget.data.id));
        toast.success('Item deleted.');
      }
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => setActiveDragId(active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveDragId(null);
    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    // Category reorder
    if (activeStr.startsWith('cat-') && overStr.startsWith('cat-')) {
      const oldIndex = categories.findIndex((c) => `cat-${c.id}` === activeStr);
      const newIndex = categories.findIndex((c) => `cat-${c.id}` === overStr);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(categories, oldIndex, newIndex).map((c, idx) => ({
        ...c,
        sort_order: idx,
      }));
      setCategories(reordered);

      try {
        await reorderCategories(reordered.map((c) => ({ id: c.id, sort_order: c.sort_order })));
      } catch {
        toast.error('Failed to save category order.');
        fetchAll();
      }
      return;
    }

    // Item reorder (within same category)
    if (activeStr.startsWith('item-') && overStr.startsWith('item-')) {
      const activeItemId = parseInt(activeStr.replace('item-', ''), 10);
      const overItemId = parseInt(overStr.replace('item-', ''), 10);

      const activeItem = items.find((i) => i.id === activeItemId);
      const overItem = items.find((i) => i.id === overItemId);

      if (!activeItem || !overItem || activeItem.category_id !== overItem.category_id) return;

      const catItems = items
        .filter((i) => i.category_id === activeItem.category_id)
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

      const oldIdx = catItems.findIndex((i) => i.id === activeItemId);
      const newIdx = catItems.findIndex((i) => i.id === overItemId);

      const reorderedCatItems = arrayMove(catItems, oldIdx, newIdx).map((i, idx) => ({
        ...i,
        sort_order: idx,
      }));

      setItems((prev) => {
        const others = prev.filter((i) => i.category_id !== activeItem.category_id);
        return [...others, ...reorderedCatItems];
      });

      try {
        await reorderItems(reorderedCatItems.map((i) => ({ id: i.id, sort_order: i.sort_order })));
      } catch {
        toast.error('Failed to save item order.');
        fetchAll();
      }
    }
  };

  const sortedCategories = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order || a.id - b.id
  );
  const categoryIds = sortedCategories.map((c) => `cat-${c.id}`);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Dashboard</h1>
              <p className="text-sm text-gray-500">
                {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} ·{' '}
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="btn-ghost p-2"
              disabled={loadingData}
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleOpenAddCategory} className="btn-primary">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Category</span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading your menu…</p>
          </div>
        ) : categories.length === 0 ? (
          /* Empty state */
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🍽️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your menu is empty</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start by creating a category like "Appetizers" or "Mains", then add items to it.
            </p>
            <button onClick={handleOpenAddCategory} className="btn-primary mx-auto">
              <Plus className="w-4 h-4" />
              Create First Category
            </button>
          </div>
        ) : (
          /* DnD category list */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {sortedCategories.map((cat) => (
                  <SortableCategoryCard
                    key={cat.id}
                    category={cat}
                    items={items}
                    onEditCategory={handleOpenEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddItem={handleOpenAddItem}
                    onEditItem={handleOpenEditItem}
                    onDeleteItem={handleDeleteItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Category Form Modal */}
      {catFormOpen && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleCategorySubmit}
          onClose={() => setCatFormOpen(false)}
          loading={catFormLoading}
        />
      )}

      {/* Item Form Modal */}
      {itemFormOpen && (
        <ItemForm
          item={editingItem
            ? editingItem
            : defaultCategoryId
            ? { category_id: defaultCategoryId }
            : null
          }
          categories={categories}
          onSubmit={handleItemSubmit}
          onClose={() => setItemFormOpen(false)}
          loading={itemFormLoading}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 text-sm mb-6">
              {deleteTarget.type === 'category' ? (
                <>
                  Delete category <strong>"{deleteTarget.data.name}"</strong>? All items inside
                  will also be permanently deleted.
                </>
              ) : (
                <>
                  Delete item <strong>"{deleteTarget.data.name}"</strong>? This cannot be undone.
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn-danger"
                disabled={deleteLoading}
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}