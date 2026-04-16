import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white font-extrabold text-xs">A2Z</span>
            </div>
            <span className="font-bold text-gray-800">A2Z Selects</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-brand-600 transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-brand-600 transition-colors">
              Shop
            </Link>
            <Link to="/admin/login" className="hover:text-brand-600 transition-colors">
              Admin
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            &copy; {year} A2Z Selects. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}