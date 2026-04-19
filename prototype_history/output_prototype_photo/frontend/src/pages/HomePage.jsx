import React, { useState } from 'react';
import PhotoGrid from '../components/PhotoGrid.jsx';
import UploadModal from '../components/UploadModal.jsx';
import usePhotos from '../hooks/usePhotos.js';

export default function HomePage() {
  const {
    photos,
    total,
    loading,
    error,
    uploading,
    uploadProgress,
    deleting,
    loadPhotos,
    upload,
    remove,
  } = usePhotos();

  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpload = async (file, title, description) => {
    await upload(file, title, description);
    showToast('Photo uploaded successfully!');
  };

  const handleDelete = async (photoId) => {
    await remove(photoId);
    showToast('Photo deleted.', 'info');
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="home-page__hero">
        <div className="container">
          <div className="home-page__hero-inner">
            <div className="home-page__hero-text">
              <h1 className="home-page__heading">
                Your Photo Gallery
              </h1>
              <p className="home-page__subheading">
                {total > 0
                  ? `${total} photo${total !== 1 ? 's' : ''} in your collection`
                  : 'Start building your collection'}
              </p>
            </div>
            <button
              className="home-page__upload-btn"
              onClick={() => setModalOpen(true)}
            >
              <span className="home-page__upload-icon">+</span>
              Upload Photo
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container home-page__content">
        {/* Error Banner */}
        {error && (
          <div className="home-page__error" role="alert">
            <span>⚠ {error}</span>
            <button className="home-page__error-retry" onClick={loadPhotos}>
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="home-page__skeletons">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="home-page__skeleton-card">
                <div className="skeleton home-page__skeleton-img" />
                <div className="home-page__skeleton-body">
                  <div className="skeleton home-page__skeleton-title" />
                  <div className="skeleton home-page__skeleton-desc" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PhotoGrid
            photos={photos}
            onDelete={handleDelete}
            deleting={deleting}
          />
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

      {/* Toast */}
      {toastMsg && (
        <div className={`home-page__toast home-page__toast--${toastMsg.type}`}>
          {toastMsg.type === 'success' ? '✓' : 'ℹ'} {toastMsg.msg}
        </div>
      )}

      <style>{`
        .home-page {
          min-height: calc(100vh - 72px);
          padding-bottom: 60px;
        }
        .home-page__hero {
          background: linear-gradient(
            135deg,
            rgba(124, 106, 247, 0.08) 0%,
            rgba(15, 15, 19, 0) 60%
          );
          border-bottom: 1px solid var(--color-border);
          padding: 40px 0 32px;
          margin-bottom: 40px;
        }
        .home-page__hero-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .home-page__heading {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 800;
          color: var(--color-text);
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .home-page__subheading {
          font-size: 15px;
          color: var(--color-text-muted);
        }
        .home-page__upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: var(--color-primary);
          color: #fff;
          border-radius: var(--radius-md);
          font-size: 15px;
          font-weight: 600;
          border: none;
          box-shadow: 0 4px 16px rgba(124, 106, 247, 0.35);
          transition: all var(--transition);
          white-space: nowrap;
        }
        .home-page__upload-btn:hover {
          background: var(--color-primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 106, 247, 0.45);
        }
        .home-page__upload-icon {
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
        }
        .home-page__content {
          animation: fadeIn 0.3s ease both;
        }
        .home-page__error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: var(--color-danger-light);
          border: 1px solid rgba(224, 92, 106, 0.3);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 14px;
          color: var(--color-danger);
        }
        .home-page__error-retry {
          background: var(--color-danger);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition);
        }
        .home-page__error-retry:hover {
          background: var(--color-danger-hover);
        }
        .home-page__skeletons {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .home-page__skeleton-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .home-page__skeleton-img {
          width: 100%;
          padding-top: 66%;
        }
        .home-page__skeleton-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .home-page__skeleton-title {
          height: 16px;
          width: 70%;
        }
        .home-page__skeleton-desc {
          height: 12px;
          width: 90%;
        }
        .home-page__toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          z-index: 300;
          box-shadow: var(--shadow-md);
          animation: fadeIn 0.25s ease both;
          white-space: nowrap;
        }
        .home-page__toast--success {
          background: var(--color-success);
          color: #fff;
        }
        .home-page__toast--info {
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
        }
        @media (max-width: 640px) {
          .home-page__hero-inner {
            flex-direction: column;
            align-items: flex-start;
          }
          .home-page__skeletons {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}