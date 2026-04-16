import React from 'react';
import { useNavigate } from 'react-router-dom';
import LiveBadge from '../shared/LiveBadge.jsx';

export default function StreamCard({ stream }) {
  const navigate = useNavigate();

  const elapsed = () => {
    const start = new Date(stream.started_at);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  return (
    <div
      className="stream-card"
      onClick={() => navigate(`/watch/${stream.stream_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/watch/${stream.stream_id}`)}
    >
      <div className="stream-card-thumbnail">
        <div className="stream-card-thumbnail-placeholder">
          <span>📺</span>
        </div>
        <div className="stream-card-badges">
          <LiveBadge />
        </div>
        <div className="stream-card-duration">{elapsed()}</div>
      </div>

      <div className="stream-card-body">
        <div className="stream-card-avatar">
          {stream.broadcaster_name.charAt(0).toUpperCase()}
        </div>
        <div className="stream-card-info">
          <h3 className="stream-card-title">{stream.title}</h3>
          <p className="stream-card-broadcaster">{stream.broadcaster_name}</p>
          {stream.description && (
            <p className="stream-card-desc">{stream.description}</p>
          )}
          <div className="stream-card-meta">
            <span className="stream-card-viewers">
              👁 {stream.viewer_count} {stream.viewer_count === 1 ? 'viewer' : 'viewers'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}