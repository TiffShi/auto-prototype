import React, { useEffect, useState } from 'react';
import Leaderboard from './Leaderboard.jsx';
import { fetchScores } from '../api/scores.js';
import '../styles/App.css';

export default function StartScreen({ onStart }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchScores()
      .then(data => {
        if (!cancelled) {
          setScores(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError('Could not load leaderboard.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="start-screen">
      <div className="start-content">
        {/* Title */}
        <div className="title-container">
          <h1 className="game-title">
            <span className="title-pac">PAC</span>
            <span className="title-dash">-</span>
            <span className="title-man">MAN</span>
          </h1>
          <div className="title-subtitle">BROWSER EDITION</div>
        </div>

        {/* Ghost decorations */}
        <div className="ghost-row">
          {['blinky', 'pinky', 'inky', 'clyde'].map(name => (
            <GhostDecoration key={name} name={name} />
          ))}
        </div>

        {/* Start button */}
        <button className="btn btn-start" onClick={onStart}>
          INSERT COIN
        </button>

        <p className="controls-hint">
          WASD or Arrow Keys to move · P to pause
        </p>

        {/* Leaderboard */}
        <div className="leaderboard-section">
          <h2 className="leaderboard-title">HIGH SCORES</h2>
          {loading && <p className="loading-text">Loading scores…</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && <Leaderboard scores={scores} />}
        </div>
      </div>
    </div>
  );
}

function GhostDecoration({ name }) {
  const colors = {
    blinky: '#FF0000',
    pinky:  '#FFB8FF',
    inky:   '#00FFFF',
    clyde:  '#FFB852',
  };
  const color = colors[name];

  return (
    <svg width="32" height="36" viewBox="0 0 32 36" className="ghost-deco">
      <g fill={color}>
        {/* Body */}
        <path d="M4,16 A12,12 0 0,1 28,16 L28,32 Q24,28 20,32 Q16,28 12,32 Q8,28 4,32 Z" />
      </g>
      {/* Eyes */}
      <circle cx="11" cy="14" r="4" fill="white" />
      <circle cx="21" cy="14" r="4" fill="white" />
      <circle cx="12" cy="14" r="2" fill="#0000CC" />
      <circle cx="22" cy="14" r="2" fill="#0000CC" />
    </svg>
  );
}