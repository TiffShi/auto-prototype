import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchVideo, fetchVideos, incrementView, deleteVideo } from '../api/videoApi.js';
import VideoPlayer from '../components/VideoPlayer.jsx';
import { getThumbnailUrl } from '../api/videoApi.js';

function formatViews(views) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [thumbErrors, setThumbErrors] = useState({});

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [videoData, allVideos] = await Promise.all([
          fetchVideo(id),
          fetchVideos(0, 20),
        ]);

        if (!cancelled) {
          setVideo(videoData);
          setRelatedVideos(
            (allVideos.videos || []).filter((v) => v.id !== id).slice(0, 10)
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || err.message || 'Video not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [id]);

  const handlePlay = useCallback(async () => {
    try {
      const result = await incrementView(id);
      setVideo((prev) => prev ? { ...prev, views: result.views } : prev);
    } catch {
      // Silently fail — view count is non-critical
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteVideo(id);
      showToast('Video deleted successfully', 'success');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete video', 'error');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-lg" />
        <p>Loading video...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2>Video not found</h2>
        <p>{error}</p>
        <Link to="/" className="btn-secondary">← Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      <div className="video-page">
        {/* Main Column */}
        <div className="video-main">
          {/* Player */}
          <div className="video-player-wrapper">
            <VideoPlayer videoId={id} onPlay={handlePlay} />
          </div>

          {/* Video Info */}
          <div className="video-info">
            <h1 className="video-info-title">{video.title}</h1>

            <div className="video-info-meta">
              <div className="video-stats">
                <span className="video-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {formatViews(video.views)} views
                </span>
                <span className="video-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatFullDate(video.created_at)}
                </span>
                {video.duration > 0 && (
                  <span className="video-stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatDuration(video.duration)}
                  </span>
                )}
                {video.file_size > 0 && (
                  <span className="video-stat" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {formatFileSize(video.file_size)}
                  </span>
                )}
              </div>

              <div className="video-actions">
                <button
                  className="btn-action btn-delete"
                  onClick={() => setShowDeleteModal(true)}
                  aria-label="Delete video"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="video-description-box">
              <h3>Description</h3>
              <p className={`video-description-text ${!video.description ? 'empty' : ''}`}>
                {video.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="video-sidebar">
          <h2>More Videos</h2>
          {relatedVideos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No other videos available.
            </p>
          ) : (
            <div className="sidebar-video-list">
              {relatedVideos.map((v) => (
                <div
                  key={v.id}
                  className="sidebar-video-item"
                  onClick={() => navigate(`/video/${v.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/video/${v.id}`)}
                  aria-label={`Watch ${v.title}`}
                >
                  <div className="sidebar-thumbnail">
                    {v.thumbnail_filename && !thumbErrors[v.id] ? (
                      <img
                        src={getThumbnailUrl(v.id)}
                        alt={v.title}
                        onError={() => setThumbErrors((prev) => ({ ...prev, [v.id]: true }))}
                        loading="lazy"
                      />
                    ) : (
                      <div className="sidebar-thumb-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M8 21h8M12 17v4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="sidebar-video-info">
                    <p className="sidebar-video-title">{v.title}</p>
                    <p className="sidebar-video-meta">
                      {formatViews(v.views)} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Video?</h2>
            <p>
              Are you sure you want to delete <strong>"{video.title}"</strong>?
              This action cannot be undone and will permanently remove the video and its thumbnail.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </>
  );
}