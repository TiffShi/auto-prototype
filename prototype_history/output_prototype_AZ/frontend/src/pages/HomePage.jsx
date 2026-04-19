import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get('/api/products')
      .then((res) => setProducts(res.data.slice(0, 8)))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            Welcome to A2Z Selects
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Discover Products
            <br />
            <span className="text-brand-200">You'll Love</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto mb-10">
            Handpicked selections from A to Z — quality items curated just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-brand-700 font-bold text-base hover:bg-brand-50 transition-colors shadow-lg"
            >
              Shop Now
            </Link>
            <a
              href="#featured"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white/10 text-white font-bold text-base hover:bg-white/20 transition-colors border border-white/30"
            >
              See Featured
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold text-brand-600">{products.length}+</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Products</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-600">100%</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Quality</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-600">A–Z</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Selection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-500 text-sm mt-1">Our latest and greatest picks</p>
          </div>
          <Link
            to="/products"
            className="text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors flex items-center gap-1"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No products yet.</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-brand-50 to-brand-100 border-y border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-800 mb-3">
            Ready to find something special?
          </h2>
          <p className="text-brand-600 mb-7 text-base">
            Browse our full catalog and discover your next favorite item.
          </p>
          <Link to="/products" className="btn-primary px-8 py-3 text-base">
            Browse All Products
          </Link>
        </div>
      </section>
    </div>
  );
}