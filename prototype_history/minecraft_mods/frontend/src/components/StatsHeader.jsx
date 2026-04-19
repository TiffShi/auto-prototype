import React from 'react';

export default function StatsHeader({ stats }) {
  const { total, resolved, unresolved } = stats;

  return (
    <div className="stats-header">
      <div className="stat-card stat-total">
        <span className="stat-icon">📊</span>
        <div className="stat-info">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Conflicts</span>
        </div>
      </div>
      <div className="stat-card stat-resolved">
        <span className="stat-icon">✅</span>
        <div className="stat-info">
          <span className="stat-value">{resolved}</span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>
      <div className="stat-card stat-unresolved">
        <span className="stat-icon">❌</span>
        <div className="stat-info">
          <span className="stat-value">{unresolved}</span>
          <span className="stat-label">Unresolved</span>
        </div>
      </div>
    </div>
  );
}