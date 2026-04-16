import React from 'react';

function SaveStatusBadge({ saveStatus }) {
  const map = {
    saved: { label: 'Saved', className: 'badge-saved' },
    unsaved: { label: 'Unsaved', className: 'badge-unsaved' },
    saving: { label: 'Saving…', className: 'badge-saving' },
  };
  const { label, className } = map[saveStatus] || map.saved;
  return <span className={`save-badge ${className}`}>{label}</span>;
}

export default function Toolbar({
  onNew,
  onSave,
  onClear,
  saveStatus,
  isDirty,
  onToggleSidebar,
  sidebarOpen,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          className="toolbar-btn icon-btn"
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      <div className="toolbar-actions">
        <button className="toolbar-btn" onClick={onNew} title="New Document (Ctrl+N)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          New
        </button>

        <button
          className={`toolbar-btn primary ${isDirty ? 'pulse' : ''}`}
          onClick={onSave}
          title="Save Document (Ctrl+S)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save
        </button>

        <button className="toolbar-btn danger" onClick={onClear} title="Clear Content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          Clear
        </button>
      </div>

      <div className="toolbar-right">
        <SaveStatusBadge saveStatus={saveStatus} />
      </div>
    </div>
  );
}