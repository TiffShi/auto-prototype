import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onUploadClick }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon">◈</span>
          <span className="navbar__brand-text">PhotoShare</span>
        </Link>

        <div className="navbar__actions">
          {location.pathname !== '/' && (
            <Link to="/" className="navbar__back-btn">
              ← Gallery
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 72px;
          background: rgba(15, 15, 19, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid transparent;
          transition: all var(--transition);
        }
        .navbar--scrolled {
          background: rgba(15, 15, 19, 0.92);
          border-bottom-color: var(--color-border);
          box-shadow: var(--shadow-sm);
        }
        .navbar__inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .navbar__brand-icon {
          font-size: 22px;
          color: var(--color-primary);
          line-height: 1;
        }
        .navbar__brand-text {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text);
          letter-spacing: -0.3px;
        }
        .navbar__actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .navbar__back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition);
        }
        .navbar__back-btn:hover {
          background: var(--color-surface-2);
          color: var(--color-text);
          border-color: var(--color-primary);
        }
      `}</style>
    </nav>
  );
}