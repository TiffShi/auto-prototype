import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // logout handles errors internally
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="navbar-logo">💧</span>
          <span className="navbar-title">Water Tracker</span>
        </div>

        <div className="navbar-right">
          {user && (
            <div className="navbar-user">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="navbar-username">{user.username}</span>
            </div>
          )}

          <button
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <span className="btn-spinner btn-spinner-sm"></span>
                Logging out...
              </>
            ) : (
              <>
                <span>🚪</span>
                Logout
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}