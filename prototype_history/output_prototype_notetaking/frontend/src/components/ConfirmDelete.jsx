import React, { useEffect, useRef } from "react";

export default function ConfirmDelete({ note, onConfirm, onCancel, loading }) {
  const cancelRef = useRef(null);

  // Focus cancel button when modal opens for accessibility
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, loading]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-box">
        <div className="modal-icon">🗑️</div>
        <h3 id="modal-title" className="modal-title">
          Delete Note
        </h3>
        <p className="modal-message">
          Are you sure you want to delete{" "}
          <strong>"{note.title}"</strong>? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button
            ref={cancelRef}
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Deleting…
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}