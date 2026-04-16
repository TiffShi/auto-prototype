import React from "react";
import NoteCard from "./NoteCard.jsx";

export default function NoteList({
  notes,
  loading,
  onSelect,
  onEdit,
  onDelete,
  onNewNote,
}) {
  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-body" />
              <div className="skeleton-line skeleton-body short" />
              <div className="skeleton-line skeleton-meta" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="state-container empty-state">
        <div className="empty-icon">🗒️</div>
        <h2 className="empty-title">No notes yet</h2>
        <p className="empty-subtitle">
          Create your first note to get started.
        </p>
        <button className="btn btn-primary" onClick={onNewNote}>
          <span className="btn-icon">+</span> Create Note
        </button>
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}