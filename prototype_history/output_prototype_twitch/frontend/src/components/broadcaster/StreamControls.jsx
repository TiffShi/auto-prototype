import React, { useState } from 'react';
import NetworkStatus from '../shared/NetworkStatus.jsx';

export default function StreamControls({ isLive, isConnected, streamInfo, onStop }) {
  const [confirming, setConfirming] = useState(false);

  const handleStopClick = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    } else {
      setConfirming(false);
      onStop();
    }
  };

  return (
    <div className="stream-controls">
      <div className="stream-controls-status">
        <NetworkStatus isConnected={isConnected} label="Signaling" />
        {streamInfo && (
          <div className="stream-controls-info">
            <span className="stream-controls-label">Stream ID:</span>
            <code className="stream-controls-id">{streamInfo.stream_id.slice(0, 8)}…</code>
          </div>
        )}
      </div>

      <div className="stream-controls-tips">
        <p className="stream-controls-tip">
          💡 Viewers on your network can watch at{' '}
          <strong>
            http://{window.location.hostname}:5173/streams
          </strong>
        </p>
      </div>

      <button
        className={`btn btn-full ${confirming ? 'btn-danger-confirm' : 'btn-danger'}`}
        onClick={handleStopClick}
      >
        {confirming ? '⚠️ Click again to confirm stop' : '⏹ Stop Stream'}
      </button>
    </div>
  );
}