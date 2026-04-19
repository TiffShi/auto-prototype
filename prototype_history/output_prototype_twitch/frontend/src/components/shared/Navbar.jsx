import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon">📡</span>
        <span className="navbar-brand-name">LocalStream</span>
      </Link>

      <div className="navbar-links">
        <Link
          to="/streams"
          className={`navbar-link ${isActive('/streams') || isActive('/watch') ? 'navbar-link--active' : ''}`}
        >
          📺 Watch
        </Link>
        <Link
          to="/broadcast"
          className={`navbar-link navbar-link--broadcast ${isActive('/broadcast') ? 'navbar-link--active' : ''}`}
        >
          🔴 Go Live
        </Link>
      </div>
    </nav>
  );
}