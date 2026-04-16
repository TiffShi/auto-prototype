import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'
    }`;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow">
              <span className="text-white font-extrabold text-xs tracking-tight">A2Z</span>
            </div>
            <span className="font-extrabold text-lg text-gray-900 group-hover:text-brand-600 transition-colors">
              A2Z Selects
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Shop
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/admin" className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/admin/upload" className="btn-primary text-xs px-4 py-2">
                  + Add Product
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-xs px-4 py-2">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="btn-secondary text-xs px-4 py-2">
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <NavLink
            to="/"
            className={navLinkClass}
            end
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          <div />
          <NavLink
            to="/products"
            className={navLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </NavLink>
          {isAuthenticated && (
            <>
              <div />
              <NavLink
                to="/admin"
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <div />
              <Link
                to="/admin/upload"
                className="btn-primary text-xs w-full"
                onClick={() => setMenuOpen(false)}
              >
                + Add Product
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-xs w-full">
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <div />
              <Link
                to="/admin/login"
                className="btn-secondary text-xs w-full"
                onClick={() => setMenuOpen(false)}
              >
                Admin Login
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}