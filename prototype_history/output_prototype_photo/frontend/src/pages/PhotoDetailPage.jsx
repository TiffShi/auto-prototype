import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPhotoById } from '../api/photosApi.js';
import DeleteButton from '../components/DeleteButton.jsx';
import usePhotos from '../hooks/usePhotos.js';

const API_URL = import.meta.env.VITE_API_URL;

export default function PhotoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { remove, deleting } = usePhotos();

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setImgLoaded(false);
    setImgError(false);

    fetchPhotoById(id)
      .then((data) => {
        if (!cancelled) setPhoto(data);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err?.response?.status === 404
              ? 'Photo not found.'
              : err?.response?.data?.detail || err?.message || 'Failed to load photo.';
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async (photoId) => {
    await remove(photoId);
    navigate('/');
  };

  const imageUrl = photo
    ? photo.url.startsWith('http')
      ? photo.url
      : `${API_URL}/uploads/${photo.filename}`
    : null;

  const formattedDate = photo
    ? new Date(photo.uploaded_at).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  if (loading) {
    return (
      <div className="detail-page">
        <div className="container detail-page__container">
          <div className="detail-page__loading">
            <div className="spinner" />
            <p>Loading photo…</p>
          </div>
        </div>
        <DetailStyles />
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <div className="container detail-page__container">
          <div className="detail-page__error-state">
            <span className="detail-page__error-icon">⚠</span>
            <h2>{error}</h2>
            <Link to="/" className="detail-page__back-link">
              ← Back to Gallery
            </Link>
          </div>
        </div>
        <DetailStyles />
      </div>
    );
  }

  return (
    <div className="detail-page fade-in">
      <div className="container detail-page__container">
        {/* Breadcrumb */}
        <nav className="detail-page__breadcrumb">
          <Link to="/" className="detail-page__breadcrumb-link">Gallery</Link>
          <span className="detail-page__breadcrumb-sep">›</span>
          <span className="detail-page__breadcrumb-current">{photo.title}</span>
        </nav>

        <div className="detail-page__layout">
          {/* Image Panel */}
          <div className="detail-page__image-panel">
            <div className="detail-page__image-wrap">
              {!imgLoaded && !imgError && (
                <div className="skeleton detail-page__img-skeleton" />
              )}
              {imgError ? (
                <div className="detail-page__img-error">
                  <span>🖼</span>
                  <p>Image unavailable</p>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={photo.title}
                  className={`detail-page__img${imgLoaded ? ' detail-page__img--loaded' : ''}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => { setImgError(true); setImgLoaded(true); }}
                />
              )}
            </div>
          </div>

          {/* Info Panel */}
          <aside className="detail-page__info-panel">
            <div className="detail-page__info-content">
              <h1 className="detail-page__title">{photo.title}</h1>

              {photo.description && (
                <p className="detail-page__description">{photo.description}</p>
              )}

              <div className="detail-page__meta">
                <div className="detail-page__meta-item">
                  <span className="detail-page__meta-label">Uploaded</span>
                  <span className="detail-page__meta-value">{formattedDate}</span>
                </div>
                <div className="detail-page__meta-item">
                  <span className="detail-page__meta-label">Filename</span>
                  <span className="detail-page__meta-value detail-page__meta-filename">
                    {photo.filename}
                  </span>
                </div>
                <div className="detail-page__meta-item">
                  <span className="detail-page__meta-label">Photo ID</span>
                  <span className="detail-page__meta-value detail-page__meta-id">
                    {photo.id}
                  </span>
                </div>
              </div>

              <div className="detail-page__actions">
                <a
                  href={imageUrl}
                  download={photo.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-page__download-btn"
                >
                  ↓ Download
                </a>
                <DeleteButton
                  photoId={photo.id}
                  photoTitle={photo.title}
                  onDelete={handleDelete}
                  isDeleting={deleting === photo.id}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
      <DetailStyles />
    </div>
  );
}

function DetailStyles() {
  return (
    <style>{`
      .detail-page {
        min-height: calc(100vh - 72px);
        padding-bottom: 60px;
      }
      .detail-page__container {
        padding-top: 32px;
      }
      .detail-page__loading,
      .detail-page__error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 80px 24px;
        text-align: center;
        color: var(--color-text-muted);
      }
      .detail-page__error-icon {
        font-size: 40px;
      }
      .detail-page__error-state h2 {
        font-size: 18px;
        color: var(--color-text);
      }
      .detail-page__back-link {
        color: var(--color-primary);
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
      }
      .detail-page__back-link:hover {
        text-decoration: underline;
      }
      .detail-page__breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 28px;
        font-size: 14px;
      }
      .detail-page__breadcrumb-link {
        color: var(--color-primary);
        font-weight: 500;
        text-decoration: none;
      }
      .detail-page__breadcrumb-link:hover {
        text-decoration: underline;
      }
      .detail-page__breadcrumb-sep {
        color: var(--color-text-faint);
      }
      .detail-page__breadcrumb-current {
        color: var(--color-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 300px;
      }
      .detail-page__layout {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 32px;
        align-items: start;
      }
      .detail-page__image-panel {
        position: sticky;
        top: 96px;
      }
      .detail-page__image-wrap {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        overflow: hidden;
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .detail-page__img-skeleton {
        width: 100%;
        height: 500px;
      }
      .detail-page__img-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 60px;
        color: var(--color-text-faint);
        font-size: 14px;
      }
      .detail-page__img-error span {
        font-size: 48px;
      }
      .detail-page__img {
        width: 100%;
        height: auto;
        max-height: 80vh;
        object-fit: contain;
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      .detail-page__img--loaded {
        opacity: 1;
      }
      .detail-page__info-panel {
        position: sticky;
        top: 96px;
      }
      .detail-page__info-content {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .detail-page__title {
        font-size: 22px;
        font-weight: 700;
        color: var(--color-text);
        line-height: 1.3;
        word-break: break-word;
      }
      .detail-page__description {
        font-size: 14px;
        color: var(--color-text-muted);
        line-height: 1.7;
        word-break: break-word;
      }
      .detail-page__meta {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        background: var(--color-surface-2);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
      }
      .detail-page__meta-item {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .detail-page__meta-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--color-text-faint);
      }
      .detail-page__meta-value {
        font-size: 13px;
        color: var(--color-text-muted);
        word-break: break-all;
      }
      .detail-page__meta-filename,
      .detail-page__meta-id {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: var(--color-primary);
      }
      .detail-page__actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .detail-page__download-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        transition: all var(--transition);
      }
      .detail-page__download-btn:hover {
        background: var(--color-border);
        color: var(--color-text);
        border-color: var(--color-primary);
      }
      @media (max-width: 900px) {
        .detail-page__layout {
          grid-template-columns: 1fr;
        }
        .detail-page__image-panel,
        .detail-page__info-panel {
          position: static;
        }
      }
      @media (max-width: 640px) {
        .detail-page__container {
          padding-top: 20px;
        }
        .detail-page__info-content {
          padding: 20px;
        }
      }
    `}</style>
  );
}