import React from 'react';
import LiveBadge from '../shared/LiveBadge.jsx';
import NetworkStatus from '../shared/NetworkStatus.jsx';

export default function StreamInfo({ stream, viewerCount, isConnected }) {
  return (
    <div className="stream-info">
      <div className="stream-info-top">
        <div className="stream-info-avatar">
          {stream.broadcaster_name.charAt(0).toUpperCase()}
        </div>
        <div className="stream-info-details">
          <h2 className="stream-info-title">{stream.title}</h2>
          <p className="stream-info-broadcaster">{stream.broadcaster_name}</p>
        </div>
        <div className="stream-info-right">
          <LiveBadge />
          <span className="stream-info-viewers">
            👁 {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
          </span>
          <NetworkStatus isConnected={isConnected} />
        </div>
      </div>
      {stream.description && (
        <p className="stream-info-desc">{stream.description}</p>
      )}
    </div>
  );
}