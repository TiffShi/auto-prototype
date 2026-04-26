import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate('/lobby');
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>⚔️</div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#fbbf24',
              marginBottom: '4px',
            }}
          >
            Trading Card Game
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Build your deck. Defeat your opponent.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#1a1a2e',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Mode toggle */}
          <div
            style={{
              display: 'flex',
              background: '#0f0f1a',
              borderRadius: '8px',
              padding: '4px',
              marginBottom: '24px',
            }}
          >
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: mode === m ? '#6366f1' : 'transparent',
                  color: mode === m ? '#fff' : '#9ca3af',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: mode === m ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {m === 'login' ? '🔑 Login' : '✨ Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: '#9ca3af',
                  marginBottom: '6px',
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                required
                minLength={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0f0f1a',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = '#374151')}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: '#9ca3af',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0f0f1a',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = '#374151')}
              />
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ef4444',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#374151' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 'bold',
                transition: 'background 0.2s',
              }}
            >
              {loading
                ? '⏳ Loading...'
                : mode === 'login'
                ? '🔑 Login'
                : '✨ Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '12px', marginTop: '16px' }}>
          Local 2-Player Trading Card Game
        </p>
      </div>
    </div>
  );
}