import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Loader2, ImageOff, Trash2 } from 'lucide-react';
import axiosClient from '../api/axiosClient.js';
import toast from 'react-hot-toast';
import styles from './MenuItemForm.module.css';

export default function MenuItemForm({ item, categories, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_available: true,
    sort_order: 0,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setForm({
        category_id: item.category_id || '',
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        is_available: item.is_available ?? true,
        sort_order: item.sort_order ?? 0,
      });
      setImagePreview(item.image_url || null);
    } else {
      setForm({
        category_id: categories[0]?.id || '',
        name: '',
        description: '',
        price: '',
        is_available: true,
        sort_order: 0,
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [item, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, or GIF images are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10 MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category_id) return;

    const payload = {
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      is_available: form.is_available,
      sort_order: Number(form.sort_order),
    };

    const savedItem = await onSubmit(payload);

    // Upload image if a new file was selected and we have an item ID
    if (imageFile && savedItem?.id) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        await axiosClient.post(`/menu-items/${savedItem.id}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Image uploaded successfully!');
      } catch {
        toast.error('Item saved but image upload failed.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(item?.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {item ? 'Edit Menu Item' : 'New Menu Item'}
          </h3>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="item-name">
                Item Name <span className={styles.required}>*</span>
              </label>
              <input
                id="item-name"
                name="name"
                type="text"
                className={styles.input}
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Margherita Pizza"
                required
                maxLength={255}
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="item-price">
                Price (USD) <span className={styles.required}>*</span>
              </label>
              <input
                id="item-price"
                name="price"
                type="number"
                className={styles.input}
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="item-category">
              Category <span className={styles.required}>*</span>
            </label>
            <select
              id="item-category"
              name="category_id"
              className={styles.select}
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="item-desc">
              Description
            </label>
            <textarea
              id="item-desc"
              name="description"
              className={styles.textarea}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the dish…"
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="item-sort">
                Sort Order
              </label>
              <input
                id="item-sort"
                name="sort_order"
                type="number"
                className={styles.input}
                value={form.sort_order}
                onChange={handleChange}
                min={0}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Availability</label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSlider} />
                <span className={styles.toggleLabel}>
                  {form.is_available ? 'Available' : 'Unavailable'}
                </span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className={styles.field}>
            <label className={styles.label}>Item Photo</label>
            <div className={styles.imageArea}>
              {imagePreview ? (
                <div className={styles.imagePreviewWrapper}>
                  <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={clearImage}
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className={styles.imagePlaceholder}>
                  <ImageOff size={28} />
                  <span>No image selected</span>
                </div>
              )}
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={15} />
                {imagePreview ? 'Change Photo' : 'Upload Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className={styles.hiddenInput}
              />
            </div>
            <span className={styles.hint}>JPEG, PNG, WebP or GIF — max 10 MB</span>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || uploadingImage || !form.name.trim() || !form.price || !form.category_id}
            >
              {loading || uploadingImage ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <Save size={16} />
              )}
              {item ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}