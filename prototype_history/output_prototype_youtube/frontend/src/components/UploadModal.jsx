import React from 'react';

export default function UploadModal({ progress, status, onClose }) {
  const isComplete = progress >= 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>
          {isComplete ? '✅ Upload Complete' : '⬆️ Uploading Video...'}
        </h2>
        <p>
          {isComplete
            ? 'Your video has been uploaded successfully and is ready to watch.'
            : status || 'Please wait while your video is being uploaded...'}
        </p>

        <div className="upload-progress-container" style={{ padding: 0, border: 'none', background: 'none' }}>
          <div className="upload-progress-header">
            <span className="upload-progress-label">
              {!isComplete && <span className="spinner" />}
              {isComplete ? 'Upload complete' : 'Uploading...'}
            </span>
            <span className="upload-progress-percent">{progress}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${isComplete ? 'complete' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {isComplete && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}