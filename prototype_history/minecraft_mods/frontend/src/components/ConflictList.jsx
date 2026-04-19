import React from 'react';
import ConflictCard from './ConflictCard.jsx';

export default function ConflictList({ conflicts, loading, onEdit, onToggleResolve, onDelete }) {
  if (loading) {
    return (
      <div className="list-state">
        <div className="spinner" />
        <p className="list-state-text">Loading conflicts...</p>
      </div>
    );
  }

  if (conflicts.length === 0) {
    return (
      <div className="list-state">
        <span className="list-empty-icon">🧱</span>
        <p className="list-state-text">No conflicts found.</p>
        <p className="list-state-sub">Add a new conflict or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="conflict-list">
      {conflicts.map((conflict) => (
        <ConflictCard
          key={conflict.id}
          conflict={conflict}
          onEdit={onEdit}
          onToggleResolve={onToggleResolve}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}