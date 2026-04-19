import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadVideo } from '../api/videoApi.js';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_EXTENSIONS = '.mp4, .webm, .ogv, .mov';

function formatFileSize(bytes) {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const validateFile = (file) => {
    if (!file) return 'Please select a video file.';
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 500 MB (your file: ${formatFileSize(file.size)}).`;
    }
    return null;
  };

  const handleFileSelect = (file) => {
    const err = validateFile(file);
    if (err) {
      showToast(err, 'error');
      setErrors((prev) => ({ ...prev, file: err }));
      return;
    }
    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, file: null }));

    // Auto-fill title from filename if empty
    if (!title.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [title]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedFile) newErrors.file = 'Please select a video file.';
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (title.trim().length > 200) newErrors.title = 'Title must be 200 characters or less.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim());
    formData.append('description', description.trim());

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus('Preparing upload...');
      setErrors({});

      const result = await uploadVideo(formData, (percent) => {
        setUploadProgress(percent);
        if (percent < 30) setUploadStatus('Uploading video...');
        else if (percent < 70) setUploadStatus('Transferring data...');
        else if (percent < 95) setUploadStatus('Almost there...');
        else setUploadStatus('Processing video...');
      });

      setUploadProgress(100);
      setUploadStatus('Upload complete!');
      setUploadedVideo(result);
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Upload failed. Please try again.';
      showToast(message, 'error');
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setUploading(false);
    setUploadProgress(0);
    setUploadStatus('');
    setUploadedVideo(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ===== Success State =====
  if (uploadedVideo) {
    return (
      <div className="upload-page">
        <div className="upload-success">
          <div className="upload-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Video Uploaded Successfully!</h2>
          <p>
            <strong>"{uploadedVideo.title}"</strong> has been uploaded and is ready to watch.
          </p>
          <div className="upload-success-actions">
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => navigate(`/video/${uploadedVideo.id}`)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Video
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              Upload Another
            </button>
            <Link to="/" className="btn-secondary">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      {/* Header */}
      <div className="upload-page-header">
        <h1>Upload Video</h1>
        <p>Share your video with the world. Supported formats: MP4, WebM, OGV, MOV (max 500 MB)</p>
      </div>

      <form className="upload-form" onSubmit={handleSubmit} noValidate>
        {/* Drop Zone */}
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogv,.mov"
            onChange={handleFileInputChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />

          {selectedFile ? (
            <>
              <svg className="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <h3>File selected</h3>
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
              {!uploading && (
                <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Click to change file
                </p>
              )}
            </>
          ) : (
            <>
              <svg className="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <h3>Drag & drop your video here</h3>
              <p>or click to browse files</p>
              <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                MP4, WebM, OGV, MOV — up to 500 MB
              </p>
            </>
          )}
        </div>
        {errors.file && (
          <p style={{ color: 'var(--accent-red-light)', fontSize: '0.85rem', marginTop: '-16px' }}>
            ⚠ {errors.file}
          </p>
        )}

        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="video-title">
            Title <span style={{ color: 'var(--accent-red)' }}>*</span>
          </label>
          <input
            id="video-title"
            type="text"
            className="form-input"
            placeholder="Enter a descriptive title for your video"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            maxLength={200}
            disabled={uploading}
            style={errors.title ? { borderColor: 'var(--accent-red)' } : {}}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {errors.title ? (
              <p style={{ color: 'var(--accent-red-light)', fontSize: '0.85rem' }}>⚠ {errors.title}</p>
            ) : (
              <span />
            )}
            <span className="char-count">{title.length}/200</span>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="video-description">
            Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="video-description"
            className="form-textarea"
            placeholder="Tell viewers about your video..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            disabled={uploading}
          />
          <span className="char-count">{description.length}/2000</span>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="upload-progress-container">
            <div className="upload-progress-header">
              <span className="upload-progress-label">
                <span className="spinner" />
                {uploadStatus}
              </span>
              <span className="upload-progress-percent">{uploadProgress}%</span>
            </div>
            <div className="progress-bar-track">
              <div
                className={`progress-bar-fill ${uploadProgress >= 100 ? 'complete' : ''}`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="upload-status-text">
              {uploadProgress < 100
                ? `Uploading ${selectedFile?.name} — ${formatFileSize(selectedFile?.size || 0)}`
                : 'Processing and generating thumbnail...'}
            </p>
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={uploading || !selectedFile || !title.trim()}
          >
            {uploading ? (
              <>
                <span className="spinner" />
                Uploading...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Video
              </>
            )}
          </button>

          {!uploading && (
            <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
          )}
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'error' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}