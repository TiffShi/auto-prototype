import React, { useState } from 'react';
import axiosClient from '../api/axiosClient.js';

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatAmount(ml) {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')}L`;
  }
  return `${ml}ml`;
}

function WaterEntryItem({ entry, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry?')) return;

    setIsDeleting(true);
    try {
      await axiosClient.delete(`/water/entries/${entry.id}`);
      onDelete(entry.id);
    } catch (err) {
      console.error('Failed to delete entry:', err);
      alert('Failed to delete entry. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <li className="water-entry-item">
      <div className="entry-icon">💧</div>
      <div className="entry-details">
        <span className="entry-amount">{formatAmount(entry.amount_ml)}</span>
        <span className="entry-time">{formatTime(entry.timestamp)}</span>
      </div>
      <button
        className="btn btn-delete"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Delete entry of ${entry.amount_ml}ml`}
        title="Delete entry"
      >
        {isDeleting ? (
          <span className="btn-spinner btn-spinner-sm"></span>
        ) : (
          '🗑️'
        )}
      </button>
    </li>
  );
}

export default function WaterLog({ entries, onEntryDeleted }) {
  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🥤</div>
        <p className="empty-state-title">No entries yet today</p>
        <p className="empty-state-subtitle">
          Start logging your water intake to track your progress!
        </p>
      </div>
    );
  }

  // Show entries in reverse chronological order (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="water-log">
      <ul className="water-entry-list">
        {sortedEntries.map((entry) => (
          <WaterEntryItem
            key={entry.id}
            entry={entry}
            onDelete={onEntryDeleted}
          />
        ))}
      </ul>
    </div>
  );
}