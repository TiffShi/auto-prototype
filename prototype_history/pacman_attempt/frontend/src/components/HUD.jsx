import React from 'react';
import '../styles/game.css';

export default function HUD({ score, lives, level }) {
  return (
    <div className="hud">
      <div className="hud-section">
        <span className="hud-label">SCORE</span>
        <span className="hud-value score-value">{score.toLocaleString()}</span>
      </div>

      <div className="hud-section">
        <span className="hud-label">LEVEL</span>
        <span className="hud-value">{level}</span>
      </div>

      <div className="hud-section">
        <span className="hud-label">LIVES</span>
        <div className="lives-display">
          {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
            <PacManIcon key={i} />
          ))}
          {lives <= 0 && <span className="hud-value" style={{ color: '#ff4444' }}>—</span>}
        </div>
      </div>
    </div>
  );
}

function PacManIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      className="life-icon"
    >
      <circle cx="9" cy="9" r="8" fill="#FFD700" />
      <polygon points="9,9 17,5 17,13" fill="black" />
    </svg>
  );
}