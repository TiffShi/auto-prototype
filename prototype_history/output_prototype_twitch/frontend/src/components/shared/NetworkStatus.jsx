import React from 'react';

export default function NetworkStatus({ isConnected, label = 'Connection' }) {
  return (
    <div className={`network-status ${isConnected ? 'network-status--connected' : 'network-status--disconnected'}`}>
      <span className="network-status-dot" />
      <span className="network-status-label">
        {isConnected ? label : 'Connecting…'}
      </span>
    </div>
  );
}