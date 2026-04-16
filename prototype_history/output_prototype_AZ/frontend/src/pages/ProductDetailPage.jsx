import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Product not found.');
        } else {
          setError('Failed to load product.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/products/${id}`);
      navigate('/products');
    } catch {
      setError('Failed to delete product.');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 font-semibold text-lg mb-4">{error}</p>
        <Link to="/products" className="btn-secondary">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const imageUrl = product.image_filename
    ? `${API_URL}/uploads/${product.image_filename}`
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square shadow-sm border border-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-between py-2">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-brand-600">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                In Stock
              </span>
            </div>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            <div className="text-xs text-gray-400 mb-6">
              Listed on{' '}
              {new Date(product.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href="mailto:contact@a2zselects.com?subject=Interested in purchasing"
              className="btn-primary w-full py-3 text-base"
            >
              Contact to Buy
            </a>
            <Link to="/products" className="btn-secondary w-full py-3 text-base">
              ← Continue Shopping
            </Link>

            {/* Admin Actions */}
            {isAuthenticated && (
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <Link
                  to={`/admin/edit/${product.id}`}
                  className="btn-secondary flex-1 text-sm"
                >
                  ✏️ Edit
                </Link>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="btn-danger flex-1 text-sm"
                  >
                    🗑️ Delete
                  </button>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="btn-danger flex-1 text-xs"
                    >
                      {deleting ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="btn-secondary flex-1 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}