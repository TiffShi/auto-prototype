import React, { useState, useEffect, useRef } from "react";

export default function NoteEditor({ note, onSave, onCancel, loading }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
    } else {
      setTitle("");
      setContent("");
    }
    setErrors({});
    titleRef.current?.focus();
  }, [note]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = "Title is required.";
    } else if (title.trim().length > 255) {
      newErrors.title = "Title must be 255 characters or fewer.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({ title: title.trim(), content });
  };

  const isEditing = Boolean(note);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2 className="editor-heading">
          {isEditing ? "Edit Note" : "New Note"}
        </h2>
      </div>

      <form className="editor-form" onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${errors.title ? "has-error" : ""}`}>
          <label className="form-label" htmlFor="note-title">
            Title <span className="required">*</span>
          </label>
          <input
            ref={titleRef}
            id="note-title"
            type="text"
            className="form-input"
            placeholder="Enter note title…"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            maxLength={255}
            disabled={loading}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <span id="title-error" className="form-error" role="alert">
              {errors.title}
            </span>
          )}
          <span className="char-count">{title.length}/255</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="note-content">
            Content
          </label>
          <textarea
            id="note-content"
            className="form-textarea"
            placeholder="Write your note here…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            disabled={loading}
          />
        </div>

        <div className="editor-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Saving…
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Note"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}