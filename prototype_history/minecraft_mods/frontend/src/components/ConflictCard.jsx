import React, { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

export default function ConflictCard({ conflict, onEdit, onToggleResolve, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    primary_mod,
    conflicting_mod,
    crash_log_snippet,
    is_resolved,
    created_at,
    updated_at,
  } = conflict;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(conflict.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className={`conflict-card ${is_resolved ? 'resolved' : 'unresolved'}`}>
      <div className="card-header">
        <div className="card-mods">
          <span className="mod-name primary">{primary_mod}</span>
          <span className="mod-vs">⚡ vs ⚡</span>
          <span className="mod-name conflicting">{conflicting_mod}</span>
        </div>
        <StatusBadge isResolved={is_resolved} />
      </div>

      <div className="card-meta">
        <span className="meta-item">
          <span className="meta-label">Created:</span> {formatDate(created_at)}
        </span>
        <span className="meta-item">
          <span className="meta-label">Updated:</span> {formatDate(updated_at)}
        </span>
      </div>

      {crash_log_snippet && (
        <div className="card-crash-section">
          <button
            className="crash-toggle"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <span className="crash-toggle-icon">{expanded ? '▼' : '▶'}</span>
            Crash Log Snippet
          </button>
          {expanded && (
            <pre className="crash-log">
              <code>{crash_log_snippet}</code>
            </pre>
          )}
        </div>
      )}

      {!crash_log_snippet && (
        <p className="no-crash-log">No crash log attached.</p>
      )}

      <div className="card-actions">
        <button
          className={`btn btn-resolve ${is_resolved ? 'btn-unresolve' : 'btn-resolve-active'}`}
          onClick={() => onToggleResolve(conflict)}
          title={is_resolved ? 'Mark as Unresolved' : 'Mark as Resolved'}
        >
          {is_resolved ? '↩ Mark Unresolved' : '✔ Mark Resolved'}
        </button>

        <button
          className="btn btn-edit"
          onClick={() => onEdit(conflict)}
          title="Edit conflict"
        >
          ✏ Edit
        </button>

        <button
          className={`btn btn-delete ${confirmDelete ? 'btn-delete-confirm' : ''}`}
          onClick={handleDeleteClick}
          title={confirmDelete ? 'Click again to confirm deletion' : 'Delete conflict'}
        >
          {confirmDelete ? '⚠ Confirm?' : '🗑 Delete'}
        </button>
      </div>
    </div>
  );
}