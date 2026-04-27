import React, { useEffect, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient.js';
import Navbar from '../components/Navbar.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import { Search, UtensilsCrossed, Loader2, AlertCircle } from 'lucide-react';
import styles from './PublicMenu.module.css';

export default function PublicMenu() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get('/public/menu');
      setCategories(data);
    } catch {
      setError('Failed to load the menu. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      menu_items: cat.menu_items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(
      (cat) =>
        (!activeCategory || cat.id === activeCategory) &&
        (search === '' || cat.menu_items.length > 0)
    );

  const scrollToCategory = (id) => {
    setActiveCategory(id === activeCategory ? null : id);
    const el = document.getElementById(`category-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>
            <UtensilsCrossed size={36} />
          </div>
          <h1 className={styles.heroTitle}>Our Menu</h1>
          <p className={styles.heroSubtitle}>
            Fresh ingredients, crafted with passion
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Search */}
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        {!loading && categories.length > 0 && (
          <div className={styles.pills}>
            <button
              className={`${styles.pill} ${!activeCategory ? styles.pillActive : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.pill} ${activeCategory === cat.id ? styles.pillActive : ''}`}
                onClick={() => scrollToCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className={styles.stateBox}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Loading menu…</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={24} />
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={fetchMenu}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredCategories.length === 0 && (
          <div className={styles.stateBox}>
            <UtensilsCrossed size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>
              {search ? 'No dishes match your search.' : 'No menu items yet.'}
            </p>
            {search && (
              <button className={styles.retryBtn} onClick={() => setSearch('')}>
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredCategories.length > 0 && (
          <div className={styles.categories}>
            {filteredCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} MenuCraft — All rights reserved</p>
      </footer>
    </div>
  );
}