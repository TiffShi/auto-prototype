import React, { useEffect, useRef } from 'react';

export default function GameLog({ logs = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '8px',
        height: '180px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#6366f1',
          marginBottom: '4px',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '4px',
        }}
      >
        📜 Game Log
      </div>
      {logs.length === 0 ? (
        <div style={{ color: '#4b5563', fontSize: '12px', fontStyle: 'italic' }}>
          No actions yet...
        </div>
      ) : (
        logs.map((log, i) => (
          <div
            key={i}
            style={{
              fontSize: '11px',
              color: i === logs.length - 1 ? '#e2e8f0' : '#9ca3af',
              padding: '1px 0',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            <span style={{ color: '#4b5563', marginRight: '4px' }}>{i + 1}.</span>
            {log}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}