import React from "react";

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NoteDetail({ note, onEdit, onDelete }) {
  return (
    <div className="note-detail">
      <div className="detail-header">
        <h2 className="detail-title">{note.title}</h2>
        <div className="detail-actions">
          <button
            className="btn btn-secondary"
            onClick={() => onEdit(note)}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete(note)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="detail-meta">
        <span className="meta-item">
          <span className="meta-label">Created:</span>{" "}
          {formatDateTime(note.created_at)}
        </span>
        <span className="meta-separator">·</span>
        <span className="meta-item">
          <span className="meta-label">Updated:</span>{" "}
          {formatDateTime(note.updated_at)}
        </span>
      </div>

      <div className="detail-divider" />

      <div className="detail-content">
        {note.content ? (
          note.content.split("\n").map((line, idx) =>
            line.trim() === "" ? (
              <br key={idx} />
            ) : (
              <p key={idx}>{line}</p>
            )
          )
        ) : (
          <p className="detail-empty">No content.</p>
        )}
      </div>
    </div>
  );
}