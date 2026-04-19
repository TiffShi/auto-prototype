import React from 'react';
import PhotoCard from './PhotoCard.jsx';

export default function PhotoGrid({ photos, onDelete, deleting }) {
  if (photos.length === 0) {
    return (
      <div className="photo-grid__empty">
        <div className="photo-grid__empty-icon">📷</div>
        <h2 className="photo-grid__empty-title">No photos yet</h2>
        <p className="photo-grid__empty-sub">
          Upload your first photo to get started!
        </p>
        <style>{`
          .photo-grid__empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 24px;
            text-align: center;
          }
          .photo-grid__empty-icon {
            font-size: 64px;
            margin-bottom: 20px;
            opacity: 0.5;
          }
          .photo-grid__empty-title {
            font-size: 22px;
            font-weight: 600;
            color: var(--color-text);
            margin-bottom: 8px;
          }
          .photo-grid__empty-sub {
            font-size: 15px;
            color: var(--color-text-muted);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onDelete={onDelete}
            isDeleting={deleting === photo.id}
          />
        ))}
      </div>
      <style>{`
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        @media (max-width: 640px) {
          .photo-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}