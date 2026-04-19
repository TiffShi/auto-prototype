import React from "react";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(text, maxLength = 120) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

export default function NoteCard({ note, onSelect, onEdit, onDelete }) {
  const handleCardClick = (e) => {
    // Prevent card click when action buttons are clicked
    if (e.target.closest(".card-actions")) return;
    onSelect(note);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(note);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(note);
  };

  return (
    <article
      className="note-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(note)}
      aria-label={`Note: ${note.title}`}
    >
      <div className="card-body">
        <h3 className="card-title">{note.title}</h3>
        <p className="card-preview">{truncate(note.content)}</p>
      </div>
      <div className="card-footer">
        <span className="card-date">{formatDate(note.updated_at)}</span>
        <div className="card-actions">
          <button
            className="action-btn edit-btn"
            onClick={handleEdit}
            aria-label="Edit note"
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            aria-label="Delete note"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </article>
  );
}