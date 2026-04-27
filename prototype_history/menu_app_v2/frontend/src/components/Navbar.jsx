import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ChefHat, LogOut, LayoutDashboard, Menu, X, Eye } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-brand-600 font-bold text-xl hover:text-brand-700 transition-colors"
          >
            <ChefHat className="w-7 h-7" />
            <span className="hidden sm:block">MenuCraft</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500 mr-1">
                  {user?.restaurant_name}
                </span>
                {isDashboard ? (
                  <Link
                    to={`/menu/${user?.id}`}
                    className="btn-secondary text-sm py-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Menu
                  </Link>
                ) : (
                  <Link to="/dashboard" className="btn-secondary text-sm py-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-ghost text-sm py-1.5">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-1.5">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {isAuthenticated ? (
            <>
              <p className="text-sm text-gray-500 pb-1">{user?.restaurant_name}</p>
              {isDashboard ? (
                <Link
                  to={`/menu/${user?.id}`}
                  className="btn-secondary w-full text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <Eye className="w-4 h-4" />
                  Preview Menu
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="btn-secondary w-full text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn-ghost w-full text-sm">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-secondary w-full text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary w-full text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}