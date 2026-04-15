import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function PhotoCard({ photo, onDelete, isDeleting }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const imageUrl = photo.url.startsWith('http')
    ? photo.url
    : `${API_URL}/uploads/${photo.filename}`;

  const formattedDate = new Date(photo.uploaded_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCardClick = (e) => {
    if (e.target.closest('.photo-card__actions')) return;
    navigate(`/photo/${photo.id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    onDelete(photo.id);
    setShowConfirm(false);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <article
      className={`photo-card${isDeleting ? ' photo-card--deleting' : ''}`}
      onClick={handleCardClick}
    >
      <div className="photo-card__image-wrap">
        {!imgLoaded && !imgError && (
          <div className="photo-card__skeleton skeleton" />
        )}
        {imgError ? (
          <div className="photo-card__placeholder">
            <span className="photo-card__placeholder-icon">🖼</span>
            <span>Image unavailable</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={photo.title}
            className={`photo-card__img${imgLoaded ? ' photo-card__img--loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            loading="lazy"
          />
        )}
        <div className="photo-card__overlay">
          <span className="photo-card__view-hint">View Photo</span>
        </div>
      </div>

      <div className="photo-card__body">
        <h3 className="photo-card__title">{photo.title}</h3>
        {photo.description && (
          <p className="photo-card__desc">{photo.description}</p>
        )}
        <div className="photo-card__meta">
          <span className="photo-card__date">{formattedDate}</span>
          <div className="photo-card__actions">
            {showConfirm ? (
              <div className="photo-card__confirm">
                <span className="photo-card__confirm-text">Delete?</span>
                <button
                  className="photo-card__btn photo-card__btn--danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? '…' : 'Yes'}
                </button>
                <button
                  className="photo-card__btn photo-card__btn--ghost"
                  onClick={handleCancelDelete}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                className="photo-card__btn photo-card__btn--delete"
                onClick={handleDeleteClick}
                title="Delete photo"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="photo-card__spinner" />
                ) : (
                  '🗑'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .photo-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
          transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
          animation: fadeIn 0.35s ease both;
        }
        .photo-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary);
        }
        .photo-card--deleting {
          opacity: 0.5;
          pointer-events: none;
        }
        .photo-card__image-wrap {
          position: relative;
          width: 100%;
          padding-top: 66%;
          overflow: hidden;
          background: var(--color-surface-2);
        }
        .photo-card__skeleton {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .photo-card__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.4s ease;
        }
        .photo-card__img--loaded {
          opacity: 1;
        }
        .photo-card:hover .photo-card__img--loaded {
          transform: scale(1.04);
        }
        .photo-card__placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--color-text-faint);
          font-size: 13px;
        }
        .photo-card__placeholder-icon {
          font-size: 32px;
        }
        .photo-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
          opacity: 0;
          transition: opacity var(--transition);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 16px;
        }
        .photo-card:hover .photo-card__overlay {
          opacity: 1;
        }
        .photo-card__view-hint {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .photo-card__body {
          padding: 14px 16px 16px;
        }
        .photo-card__title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .photo-card__desc {
          font-size: 13px;
          color: var(--color-text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .photo-card__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .photo-card__date {
          font-size: 12px;
          color: var(--color-text-faint);
        }
        .photo-card__actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .photo-card__confirm {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .photo-card__confirm-text {
          font-size: 12px;
          color: var(--color-text-muted);
        }
        .photo-card__btn {
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          border: 1px solid transparent;
        }
        .photo-card__btn--delete {
          background: transparent;
          border-color: transparent;
          color: var(--color-text-faint);
          font-size: 15px;
          padding: 4px 6px;
          border-radius: var(--radius-sm);
        }
        .photo-card__btn--delete:hover {
          background: var(--color-danger-light);
          color: var(--color-danger);
        }
        .photo-card__btn--danger {
          background: var(--color-danger);
          color: #fff;
        }
        .photo-card__btn--danger:hover:not(:disabled) {
          background: var(--color-danger-hover);
        }
        .photo-card__btn--ghost {
          background: var(--color-surface-2);
          border-color: var(--color-border);
          color: var(--color-text-muted);
        }
        .photo-card__btn--ghost:hover {
          background: var(--color-border);
          color: var(--color-text);
        }
        .photo-card__spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
      `}</style>
    </article>
  );
}