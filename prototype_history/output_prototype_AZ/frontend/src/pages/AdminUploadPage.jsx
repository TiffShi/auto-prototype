import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios.js';

export default function AdminUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        image: 'Only JPEG, PNG, GIF, or WEBP images are allowed.',
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        image: 'Image must be under 10 MB.',
      }));
      return;
    }

    setImageFile(file);
    setFieldErrors((prev) => ({ ...prev, image: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Product name is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      errors.price = 'Please enter a valid price greater than 0.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('price', Number(form.price));
    if (imageFile) formData.append('image', imageFile);

    try {
      await axiosInstance.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create product.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/admin" className="hover:text-brand-600 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Add Product</span>
      </nav>

      <div className="card p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Add New Product</h1>
        <p className="text-gray-500 text-sm mb-8">Fill in the details to list a new product.</p>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="label">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
              className={`input-field ${fieldErrors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="label">
              Price (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className={`input-field pl-7 ${fieldErrors.price ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </div>
            {fieldErrors.price && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your product..."
              className="input-field resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="label">Product Image</label>
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand-400 transition-colors cursor-pointer"
              >
                <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WEBP — max 10 MB</p>
              </label>
            )}
            <input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            {fieldErrors.image && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.image}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Add Product'
              )}
            </button>
            <Link to="/admin" className="btn-secondary flex-1 py-3 text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}