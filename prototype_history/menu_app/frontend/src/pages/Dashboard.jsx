import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient.js';
import Navbar from '../components/Navbar.jsx';
import CategoryForm from '../components/CategoryForm.jsx';
import MenuItemForm from '../components/MenuItemForm.jsx';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  ToggleLeft,
  ToggleRight,
  ImageOff,
  FolderOpen,
} from 'lucide-react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Category form state
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catLoading, setCatLoading] = useState(false);

  // Item form state
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);

  // Expanded categories
  const [expandedCats, setExpandedCats] = useState({});

  // Active category filter
  const [activeCatFilter, setActiveCatFilter] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        axiosClient.get('/categories'),
        axiosClient.get('/menu-items'),
      ]);
      setCategories(catsRes.data);
      setMenuItems(itemsRes.data);
      // Expand all categories by default
      const expanded = {};
      catsRes.data.forEach((c) => (expanded[c.id] = true));
      setExpandedCats(expanded);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  const handleCreateCategory = async (payload) => {
    setCatLoading(true);
    try {
      const { data } = await axiosClient.post('/categories', payload);
      setCategories((prev) => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      setExpandedCats((prev) => ({ ...prev, [data.id]: true }));
      toast.success(`Category "${data.name}" created!`);
      setCatFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create category.');
    } finally {
      setCatLoading(false);
    }
  };

  const handleUpdateCategory = async (payload) => {
    if (!editingCat) return;
    setCatLoading(true);
    try {
      const { data } = await axiosClient.put(`/categories/${editingCat.id}`, payload);
      setCategories((prev) =>
        prev.map((c) => (c.id === data.id ? data : c)).sort((a, b) => a.sort_order - b.sort_order)
      );
      toast.success(`Category updated!`);
      setEditingCat(null);
      setCatFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update category.');
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}" and all its items?`)) return;
    try {
      await axiosClient.delete(`/categories/${cat.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setMenuItems((prev) => prev.filter((i) => i.category_id !== cat.id));
      toast.success(`Category "${cat.name}" deleted.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete category.');
    }
  };

  // ── Menu Item CRUD ─────────────────────────────────────────────────────────

  const handleCreateItem = async (payload) => {
    setItemLoading(true);
    try {
      const { data } = await axiosClient.post('/menu-items', payload);
      setMenuItems((prev) => [...prev, data]);
      toast.success(`"${data.name}" added!`);
      setItemFormOpen(false);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create item.');
      return null;
    } finally {
      setItemLoading(false);
    }
  };

  const handleUpdateItem = async (payload) => {
    if (!editingItem) return null;
    setItemLoading(true);
    try {
      const { data } = await axiosClient.put(`/menu-items/${editingItem.id}`, payload);
      setMenuItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
      toast.success(`"${data.name}" updated!`);
      setEditingItem(null);
      setItemFormOpen(false);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update item.');
      return null;
    } finally {
      setItemLoading(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await axiosClient.delete(`/menu-items/${item.id}`);
      setMenuItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`"${item.name}" deleted.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete item.');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const { data } = await axiosClient.put(`/menu-items/${item.id}`, {
        is_available: !item.is_available,
      });
      setMenuItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
      toast.success(`"${data.name}" marked as ${data.is_available ? 'available' : 'unavailable'}.`);
    } catch {
      toast.error('Failed to update availability.');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openEditCat = (cat) => {
    setEditingCat(cat);
    setCatFormOpen(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemFormOpen(true);
  };

  const openNewItem = (categoryId) => {
    setEditingItem(categoryId ? { category_id: categoryId } : null);
    setItemFormOpen(true);
  };

  const toggleCatExpand = (id) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getItemsForCategory = (catId) =>
    menuItems
      .filter((i) => i.category_id === catId)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  const displayedCategories = activeCatFilter
    ? categories.filter((c) => c.id === activeCatFilter)
    : categories;

  const totalItems = menuItems.length;
  const availableItems = menuItems.filter((i) => i.is_available).length;

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Manage your restaurant menu</p>
          </div>
          <Link to="/" className={styles.previewBtn}>
            <Eye size={15} />
            Preview Menu
          </Link>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{categories.length}</span>
              <span className={styles.statLabel}>Categories</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{totalItems}</span>
              <span className={styles.statLabel}>Total Items</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.statGreen}`}>{availableItems}</span>
              <span className={styles.statLabel}>Available</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.statMuted}`}>
                {totalItems - availableItems}
              </span>
              <span className={styles.statLabel}>Unavailable</span>
            </div>
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className={styles.stateBox}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Loading…</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={22} />
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={fetchData}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className={styles.content}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.filterPills}>
                <button
                  className={`${styles.filterPill} ${!activeCatFilter ? styles.filterPillActive : ''}`}
                  onClick={() => setActiveCatFilter(null)}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`${styles.filterPill} ${activeCatFilter === cat.id ? styles.filterPillActive : ''}`}
                    onClick={() => setActiveCatFilter(cat.id === activeCatFilter ? null : cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className={styles.toolbarActions}>
                <button
                  className={styles.addCatBtn}
                  onClick={() => { setEditingCat(null); setCatFormOpen(true); }}
                >
                  <Plus size={16} />
                  Add Category
                </button>
                <button
                  className={styles.addItemBtn}
                  onClick={() => openNewItem(null)}
                  disabled={categories.length === 0}
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
            </div>

            {/* Empty state */}
            {categories.length === 0 && (
              <div className={styles.emptyState}>
                <FolderOpen size={48} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No categories yet</h3>
                <p className={styles.emptyText}>
                  Start by creating a category, then add menu items to it.
                </p>
                <button
                  className={styles.addCatBtn}
                  onClick={() => { setEditingCat(null); setCatFormOpen(true); }}
                >
                  <Plus size={16} />
                  Create First Category
                </button>
              </div>
            )}

            {/* Category Sections */}
            {displayedCategories.map((cat) => {
              const items = getItemsForCategory(cat.id);
              const isExpanded = expandedCats[cat.id] ?? true;

              return (
                <section key={cat.id} className={styles.catSection}>
                  {/* Category Header */}
                  <div className={styles.catHeader}>
                    <button
                      className={styles.catToggle}
                      onClick={() => toggleCatExpand(cat.id)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <span className={styles.catName}>{cat.name}</span>
                      <span className={styles.catBadge}>{items.length}</span>
                    </button>

                    <div className={styles.catActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openNewItem(cat.id)}
                        title="Add item to this category"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditCat(cat)}
                        title="Edit category"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleDeleteCategory(cat)}
                        title="Delete category"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Items Table */}
                  {isExpanded && (
                    <div className={styles.itemsWrapper}>
                      {items.length === 0 ? (
                        <div className={styles.emptyItems}>
                          <p>No items in this category.</p>
                          <button
                            className={styles.addItemInline}
                            onClick={() => openNewItem(cat.id)}
                          >
                            <Plus size={14} /> Add first item
                          </button>
                        </div>
                      ) : (
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th className={styles.thImg}></th>
                              <th className={styles.thName}>Name</th>
                              <th className={styles.thDesc}>Description</th>
                              <th className={styles.thPrice}>Price</th>
                              <th className={styles.thStatus}>Status</th>
                              <th className={styles.thActions}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => (
                              <tr key={item.id} className={styles.tableRow}>
                                <td className={styles.tdImg}>
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className={styles.itemThumb}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className={styles.itemThumbFallback}>
                                      <ImageOff size={14} />
                                    </div>
                                  )}
                                </td>
                                <td className={styles.tdName}>{item.name}</td>
                                <td className={styles.tdDesc}>
                                  <span className={styles.descClamp}>
                                    {item.description || <em className={styles.noDesc}>—</em>}
                                  </span>
                                </td>
                                <td className={styles.tdPrice}>
                                  ${parseFloat(item.price).toFixed(2)}
                                </td>
                                <td className={styles.tdStatus}>
                                  <button
                                    className={`${styles.statusBadge} ${item.is_available ? styles.statusAvailable : styles.statusUnavailable}`}
                                    onClick={() => handleToggleAvailability(item)}
                                    title="Toggle availability"
                                  >
                                    {item.is_available ? (
                                      <ToggleRight size={14} />
                                    ) : (
                                      <ToggleLeft size={14} />
                                    )}
                                    {item.is_available ? 'Available' : 'Unavailable'}
                                  </button>
                                </td>
                                <td className={styles.tdActions}>
                                  <button
                                    className={styles.iconBtn}
                                    onClick={() => openEditItem(item)}
                                    title="Edit item"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                    onClick={() => handleDeleteItem(item)}
                                    title="Delete item"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Category Form Modal */}
      {catFormOpen && (
        <CategoryForm
          category={editingCat}
          onSubmit={editingCat ? handleUpdateCategory : handleCreateCategory}
          onCancel={() => { setCatFormOpen(false); setEditingCat(null); }}
          loading={catLoading}
        />
      )}

      {/* Menu Item Form Modal */}
      {itemFormOpen && (
        <MenuItemForm
          item={editingItem?.id ? editingItem : null}
          categories={categories}
          onSubmit={editingItem?.id ? handleUpdateItem : handleCreateItem}
          onCancel={() => { setItemFormOpen(false); setEditingItem(null); }}
          loading={itemLoading}
        />
      )}
    </div>
  );
}