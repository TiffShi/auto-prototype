import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, LayoutDashboard, UtensilsCrossed, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <UtensilsCrossed size={22} className={styles.brandIcon} />
          <span className={styles.brandText}>MenuCraft</span>
        </Link>

        <div className={styles.desktopLinks}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            Menu
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <span className={styles.userEmail}>{user?.email}</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              Owner Login
            </Link>
          )}
        </div>

        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link
            to="/"
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            Public Menu
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button className={styles.mobileLinkBtn} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              Owner Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}