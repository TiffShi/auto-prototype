import React, { useState } from 'react';

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Sidebar({ documents, currentDocId, loading, onLoad, onDelete, onNew }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = (e, id) => {
    e.stopPropagation();
    onDelete(id);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Documents</h2>
        <button className="sidebar-new-btn" onClick={onNew} title="New Document">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="sidebar-list">
        {loading && (
          <div className="sidebar-loading">
            <div className="spinner" />
            <span>Loading…</span>
          </div>
        )}

        {!loading && documents.length === 0 && (
          <div className="sidebar-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>No documents yet</p>
            <button className="btn-link" onClick={onNew}>
              Create your first document
            </button>
          </div>
        )}

        {!loading &&
          documents.map((doc) => (
            <div
              key={doc.id}
              className={`sidebar-item ${currentDocId === doc.id ? 'active' : ''}`}
              onClick={() => onLoad(doc.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onLoad(doc.id)}
            >
              <div className="sidebar-item-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-title">{doc.title || 'Untitled'}</span>
                <span className="sidebar-item-meta">
                  {formatDate(doc.updated_at)} · {formatTime(doc.updated_at)}
                </span>
              </div>

              {confirmDeleteId === doc.id ? (
                <div className="delete-confirm">
                  <button
                    className="confirm-yes"
                    onClick={(e) => handleConfirmDelete(e, doc.id)}
                    title="Confirm delete"
                  >
                    ✓
                  </button>
                  <button
                    className="confirm-no"
                    onClick={handleCancelDelete}
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className="sidebar-delete-btn"
                  onClick={(e) => handleDeleteClick(e, doc.id)}
                  title="Delete document"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}