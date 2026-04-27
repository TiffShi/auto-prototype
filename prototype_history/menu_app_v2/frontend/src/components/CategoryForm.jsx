import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const EMPTY = { name: '', description: '', is_published: true };

export default function CategoryForm({ category, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
        is_published: category.is_published ?? true,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [category]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Category name is required.';
    if (form.name.trim().length > 255) errs.name = 'Name must be 255 characters or fewer.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      is_published: form.is_published,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="label" htmlFor="cat-name">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              name="name"
              type="text"
              className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="e.g. Appetizers"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="cat-desc">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="cat-desc"
              name="description"
              rows={3}
              className="input-field resize-none"
              placeholder="Brief description of this category…"
              value={form.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Published toggle */}
          <div className="flex items-center gap-3">
            <input
              id="cat-published"
              name="is_published"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              checked={form.is_published}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="cat-published" className="text-sm text-gray-700 cursor-pointer">
              Publish this category (visible to customers)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}