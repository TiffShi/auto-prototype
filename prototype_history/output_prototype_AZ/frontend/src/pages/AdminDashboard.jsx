import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    axiosInstance
      .get('/api/products')
      .then((res) => setProducts(res.data))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccessMsg('Product deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to delete product.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/upload" className="btn-primary">
            + Add Product
          </Link>
          <button onClick={logout} className="btn-secondary text-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Total Products
          </p>
          <p className="text-3xl font-extrabold text-brand-600">{products.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Total Value
          </p>
          <p className="text-3xl font-extrabold text-brand-600">
            ${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Avg. Price
          </p>
          <p className="text-3xl font-extrabold text-brand-600">
            {products.length > 0
              ? `$${(products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(2)}`
              : '$0.00'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center">
            <svg className="animate-spin w-8 h-8 text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-400 text-sm mt-3">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 font-medium">No products found.</p>
            {!search && (
              <Link to="/admin/upload" className="btn-primary mt-4 inline-flex">
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Product
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">
                  Description
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Price
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">
                  Added
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => {
                const imageUrl = product.image_filename
                  ? `${API_URL}/uploads/${product.image_filename}`
                  : null;
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-gray-500 line-clamp-2 text-xs max-w-xs">
                        {product.description || <span className="italic text-gray-300">No description</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-brand-600">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-gray-400 text-xs">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-xs text-gray-500 hover:text-brand-600 font-medium transition-colors px-2 py-1 rounded hover:bg-brand-50"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/edit/${product.id}`}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors px-2 py-1 rounded hover:bg-brand-50"
                        >
                          Edit
                        </Link>
                        {confirmDeleteId === product.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingId === product.id}
                              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                            >
                              {deletingId === product.id ? '...' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 font-medium transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}