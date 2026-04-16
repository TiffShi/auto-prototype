import React from 'react';

export default function FullscreenBtn({ isFullscreen, onToggle }) {
  return (
    <button
      className="video-ctrl-btn fullscreen-btn"
      onClick={onToggle}
      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
    >
      {isFullscreen ? '⛶' : '⛶'}
      <span className="fullscreen-btn-label">
        {isFullscreen ? 'Exit' : 'Fullscreen'}
      </span>
    </button>
  );
}