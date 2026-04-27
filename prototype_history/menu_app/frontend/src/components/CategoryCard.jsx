import React, { useState } from 'react';
import MenuItemCard from './MenuItemCard.jsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './CategoryCard.module.css';

export default function CategoryCard({ category }) {
  const [collapsed, setCollapsed] = useState(false);
  const itemCount = category.menu_items?.length || 0;

  return (
    <section className={styles.section} id={`category-${category.id}`}>
      <button
        className={styles.header}
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
      >
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{category.name}</h2>
          <span className={styles.count}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
        <span className={styles.chevron}>
          {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </span>
      </button>

      {!collapsed && (
        <div className={styles.grid}>
          {itemCount === 0 ? (
            <p className={styles.empty}>No items in this category yet.</p>
          ) : (
            category.menu_items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))
          )}
        </div>
      )}
    </section>
  );
}