import React from 'react';
import '../styles/App.css';

function StatsBar({ count, limit }) {
  if (limit === 0) return null;

  const percentage = ((count / limit) * 100).toFixed(1);

  return (
    <div className="stats-bar">
      <div className="stat-card stat-card--prime">
        <span className="stat-value">{count.toLocaleString()}</span>
        <span className="stat-label">Primes Found</span>
      </div>
      <div className="stat-card stat-card--limit">
        <span className="stat-value">{limit.toLocaleString()}</span>
        <span className="stat-label">Upper Limit</span>
      </div>
      <div className="stat-card stat-card--composite">
        <span className="stat-value">{(limit - count).toLocaleString()}</span>
        <span className="stat-label">Composites</span>
      </div>
      <div className="stat-card stat-card--percent">
        <span className="stat-value">{percentage}%</span>
        <span className="stat-label">Prime Density</span>
      </div>
    </div>
  );
}

export default StatsBar;