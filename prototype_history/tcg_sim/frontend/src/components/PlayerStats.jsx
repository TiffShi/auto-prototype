import React from 'react';

function HPBar({ current, max = 20 }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 50 ? '#4ade80' : pct > 25 ? '#fbbf24' : '#ef4444';
  return (
    <div
      style={{
        width: '100%',
        height: '8px',
        background: '#374151',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          transition: 'width 0.5s ease',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}

function ManaOrbs({ current, max }) {
  return (
    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: i < current ? '#818cf8' : '#1e1b4b',
            border: '1px solid #4338ca',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  );
}

export default function PlayerStats({ player, isOpponent = false, isActive = false }) {
  if (!player) return null;

  return (
    <div
      style={{
        background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(17,24,39,0.8)',
        border: `2px solid ${isActive ? '#6366f1' : '#374151'}`,
        borderRadius: '10px',
        padding: '12px',
        minWidth: '180px',
        transition: 'all 0.3s',
        boxShadow: isActive ? '0 0 16px rgba(99,102,241,0.3)' : 'none',
      }}
    >
      {/* Username */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '16px' }}>{isOpponent ? '👤' : '🧙'}</span>
        <span
          style={{
            fontWeight: 'bold',
            color: isActive ? '#a5b4fc' : '#e2e8f0',
            fontSize: '14px',
          }}
        >
          {player.username}
        </span>
        {isActive && (
          <span
            style={{
              fontSize: '10px',
              background: '#6366f1',
              color: '#fff',
              padding: '1px 5px',
              borderRadius: '4px',
            }}
          >
            TURN
          </span>
        )}
      </div>

      {/* HP */}
      <div style={{ marginBottom: '6px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3px',
          }}
        >
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>❤️ HP</span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: player.hp > 10 ? '#4ade80' : player.hp > 5 ? '#fbbf24' : '#ef4444',
            }}
          >
            {player.hp} / 20
          </span>
        </div>
        <HPBar current={player.hp} max={20} />
      </div>

      {/* Mana */}
      <div style={{ marginBottom: '6px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3px',
          }}
        >
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>💎 Mana</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#818cf8' }}>
            {player.mana} / {player.max_mana}
          </span>
        </div>
        <ManaOrbs current={player.mana} max={player.max_mana} />
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#9ca3af',
        }}
      >
        <span>🃏 Hand: {player.hand_count}</span>
        <span>📚 Deck: {player.deck_count}</span>
      </div>
    </div>
  );
}