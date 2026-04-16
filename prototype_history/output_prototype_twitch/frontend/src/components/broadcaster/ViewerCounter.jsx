import React from 'react';

export default function ViewerCounter({ count }) {
  return (
    <div className="viewer-counter">
      <span className="viewer-counter-icon">👁</span>
      <span className="viewer-counter-count">{count}</span>
      <span className="viewer-counter-label">{count === 1 ? 'viewer' : 'viewers'}</span>
    </div>
  );
}