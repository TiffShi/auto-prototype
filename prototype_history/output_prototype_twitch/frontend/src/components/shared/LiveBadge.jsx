import React from 'react';

export default function LiveBadge({ pulse = true }) {
  return (
    <span className={`live-badge ${pulse ? 'live-badge--pulse' : ''}`}>
      <span className="live-badge-dot" />
      LIVE
    </span>
  );
}