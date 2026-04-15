import React, { useState, useRef, useCallback } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 10;

export default function UploadModal({ isOpen, onClose, onUpload, uploading, uploadProgress }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setTitle('');
    setDescription('');
    setFieldError('');
    setDragOver(false);
  };

  const handleClose = () => {
    if (uploading) return;
    resetForm();
    onClose();
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setFieldError('Only JPEG, PNG, GIF, and WebP images are accepted.');
      return;
    }
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setFieldError(`File size must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFieldError('');
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setFieldError('Please select an image file.'); return; }
    if (!title.trim()) { setFieldError('Title is required.'); return; }
    setFieldError('');
    try {
      await onUpload(file, title.trim(), description.trim());
      resetForm();
      onClose();
    } catch (err) {
      setFieldError(err.message || 'Upload failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Upload Photo"
      >
        <div className="modal__header">
          <h2 className="modal__title">Upload Photo</h2>
          <button
            className="modal__close"
            onClick={handleClose}
            disabled={uploading}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          {/* Drop Zone */}
          <div
            className={`modal__dropzone${dragOver ? ' modal__dropzone--active' : ''}${file ? ' modal__dropzone--has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="modal__preview-wrap">
                <img src={preview} alt="Preview" className="modal__preview-img" />
                <button
                  type="button"
                  className="modal__preview-remove"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="modal__dropzone-inner">
                <span className="modal__dropzone-icon">📁</span>
                <p className="modal__dropzone-text">
                  Drag & drop an image here, or{' '}
                  <span className="modal__dropzone-link">browse</span>
                </p>
                <p className="modal__dropzone-hint">
                  JPEG, PNG, GIF, WebP · Max {MAX_SIZE_MB} MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileChange}
              className="modal__file-input"
              disabled={uploading}
            />
          </div>

          {/* Title */}
          <div className="modal__field">
            <label className="modal__label" htmlFor="photo-title">
              Title <span className="modal__required">*</span>
            </label>
            <input
              id="photo-title"
              type="text"
              className="modal__input"
              placeholder="Give your photo a title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              disabled={uploading}
              required
            />
          </div>

          {/* Description */}
          <div className="modal__field">
            <label className="modal__label" htmlFor="photo-desc">
              Description
            </label>
            <textarea
              id="photo-desc"
              className="modal__textarea"
              placeholder="Add a description (optional)…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              disabled={uploading}
            />
          </div>

          {/* Error */}
          {fieldError && (
            <div className="modal__error" role="alert">
              ⚠ {fieldError}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="modal__progress-wrap">
              <div className="modal__progress-bar">
                <div
                  className="modal__progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="modal__progress-label">{uploadProgress}%</span>
            </div>
          )}

          {/* Actions */}
          <div className="modal__actions">
            <button
              type="button"
              className="modal__btn modal__btn--cancel"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal__btn modal__btn--submit"
              disabled={uploading || !file || !title.trim()}
            >
              {uploading ? (
                <>
                  <span className="modal__btn-spinner" />
                  Uploading…
                </>
              ) : (
                'Upload Photo'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeInScale 0.2s ease both;
        }
        .modal {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
          animation: fadeInScale 0.25s ease both;
        }
        .modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px 0;
        }
        .modal__title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text);
        }
        .modal__close {
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal__close:hover:not(:disabled) {
          background: var(--color-border);
          color: var(--color-text);
        }
        .modal__form {
          padding: 20px 28px 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .modal__dropzone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          min-height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition);
          position: relative;
          overflow: hidden;
          background: var(--color-surface-2);
        }
        .modal__dropzone:hover,
        .modal__dropzone--active {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }
        .modal__dropzone--has-file {
          cursor: default;
          border-style: solid;
          border-color: var(--color-primary);
          min-height: 200px;
        }
        .modal__dropzone-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px;
          text-align: center;
        }
        .modal__dropzone-icon {
          font-size: 36px;
          opacity: 0.6;
        }
        .modal__dropzone-text {
          font-size: 14px;
          color: var(--color-text-muted);
        }
        .modal__dropzone-link {
          color: var(--color-primary);
          font-weight: 600;
        }
        .modal__dropzone-hint {
          font-size: 12px;
          color: var(--color-text-faint);
        }
        .modal__file-input {
          display: none;
        }
        .modal__preview-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 200px;
        }
        .modal__preview-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: calc(var(--radius-lg) - 2px);
        }
        .modal__preview-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.6);
          border: none;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--transition);
        }
        .modal__preview-remove:hover {
          background: var(--color-danger);
        }
        .modal__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .modal__label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .modal__required {
          color: var(--color-danger);
        }
        .modal__input,
        .modal__textarea {
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          color: var(--color-text);
          font-family: var(--font);
          font-size: 14px;
          transition: border-color var(--transition);
          resize: vertical;
        }
        .modal__input:focus,
        .modal__textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }
        .modal__input::placeholder,
        .modal__textarea::placeholder {
          color: var(--color-text-faint);
        }
        .modal__error {
          background: var(--color-danger-light);
          border: 1px solid rgba(224, 92, 106, 0.3);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: 13px;
          color: var(--color-danger);
        }
        .modal__progress-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .modal__progress-bar {
          flex: 1;
          height: 6px;
          background: var(--color-border);
          border-radius: 3px;
          overflow: hidden;
        }
        .modal__progress-fill {
          height: 100%;
          background: var(--color-primary);
          border-radius: 3px;
          transition: width 0.2s ease;
        }
        .modal__progress-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-primary);
          min-width: 36px;
          text-align: right;
        }
        .modal__actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .modal__btn {
          padding: 10px 22px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .modal__btn--cancel {
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
        }
        .modal__btn--cancel:hover:not(:disabled) {
          background: var(--color-border);
          color: var(--color-text);
        }
        .modal__btn--submit {
          background: var(--color-primary);
          color: #fff;
          border: 1px solid transparent;
        }
        .modal__btn--submit:hover:not(:disabled) {
          background: var(--color-primary-hover);
        }
        .modal__btn-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
      `}</style>
    </div>
  );
}