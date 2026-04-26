import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/lobby', label: '🏠 Lobby' },
    { path: '/collection', label: '📚 Collection' },
    { path: '/deck-builder', label: '🃏 Deck Builder' },
  ];

  return (
    <nav
      style={{
        background: '#0f0f1a',
        borderBottom: '1px solid #1e293b',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        gap: '8px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '18px',
          color: '#fbbf24',
          marginRight: '16px',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/lobby')}
      >
        ⚔️ TCG
      </div>

      {/* Nav links */}
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            padding: '6px 14px',
            background:
              location.pathname === item.path ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: location.pathname === item.path ? '#a5b4fc' : '#9ca3af',
            border: `1px solid ${
              location.pathname === item.path ? '#6366f1' : 'transparent'
            }`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: location.pathname === item.path ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          {item.label}
        </button>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User info */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>
            👤 <strong style={{ color: '#e2e8f0' }}>{user.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '5px 12px',
              background: '#3b1515',
              color: '#ef4444',
              border: '1px solid #7f1d1d',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}