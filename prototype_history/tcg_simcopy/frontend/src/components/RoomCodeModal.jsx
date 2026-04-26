import React, { useState } from 'react';

export default function RoomCodeModal({ roomCode, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          border: '2px solid #6366f1',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(99,102,241,0.3)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
        <h2
          style={{
            color: '#e2e8f0',
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          Room Created!
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
          Share this code with your opponent so they can join.
        </p>

        <div
          style={{
            background: '#0f0f1a',
            border: '2px solid #374151',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#fbbf24',
              letterSpacing: '8px',
              fontFamily: 'monospace',
            }}
          >
            {roomCode}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '10px 20px',
              background: copied ? '#4ade80' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background 0.2s',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#374151',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}