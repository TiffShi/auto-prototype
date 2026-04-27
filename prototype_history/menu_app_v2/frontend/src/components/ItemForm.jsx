import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import ImageUploader from './ImageUploader.jsx';

const EMPTY = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  is_available: true,
};

export default function ItemForm({ item, categories, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        description: item.description || '',
        price: item.price != null ? String(item.price) : '',
        category_id: item.category_id != null ? String(item.category_id) : '',
        is_available: item.is_available ?? true,
      });
    } else {
      setForm({
        ...EMPTY,
        category_id: categories.length > 0 ? String(categories[0].id) : '',
      });
    }
    setImageFile(null);
    setErrors({});
  }, [item, categories]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Item name is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = 'Enter a valid price greater than 0.';
    if (!form.category_id) errs.category_id = 'Please select a category.';
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
    onSubmit(
      {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(Number(form.price).toFixed(2)),
        category_id: parseInt(form.category_id, 10),
        is_available: form.is_available,
      },
      imageFile
    );
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {item ? 'Edit Item' : 'New Menu Item'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Image */}
          <div>
            <label className="label">Item Photo</label>
            <ImageUploader
              currentImageUrl={item?.image_url || null}
              onFileSelect={setImageFile}
              disabled={loading}
            />
          </div>

          {/* Name */}
          <div>
            <label className="label" htmlFor="item-name">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              id="item-name"
              name="name"
              type="text"
              className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="e.g. Grilled Salmon"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="item-desc">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="item-desc"
              name="description"
              rows={3}
              className="input-field resize-none"
              placeholder="Describe the dish, ingredients, allergens…"
              value={form.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Price + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="item-price">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                id="item-price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                className={`input-field ${errors.price ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="label" htmlFor="item-category">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="item-category"
                name="category_id"
                className={`input-field ${errors.category_id ? 'border-red-400 focus:ring-red-400' : ''}`}
                value={form.category_id}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <input
              id="item-available"
              name="is_available"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              checked={form.is_available}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="item-available" className="text-sm text-gray-700 cursor-pointer">
              Item is currently available
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {item ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}