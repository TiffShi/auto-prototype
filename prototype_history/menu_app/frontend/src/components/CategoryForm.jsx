import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import styles from './CategoryForm.module.css';

export default function CategoryForm({ category, onSubmit, onCancel, loading }) {
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSortOrder(category.sort_order ?? 0);
    } else {
      setName('');
      setSortOrder(0);
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), sort_order: Number(sortOrder) });
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {category ? 'Edit Category' : 'New Category'}
          </h3>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cat-name">
              Category Name <span className={styles.required}>*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appetizers, Main Course…"
              required
              autoFocus
              maxLength={255}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="cat-sort">
              Sort Order
            </label>
            <input
              id="cat-sort"
              type="number"
              className={styles.input}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min={0}
              max={9999}
            />
            <span className={styles.hint}>Lower numbers appear first.</span>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading || !name.trim()}>
              {loading ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <Save size={16} />
              )}
              {category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}