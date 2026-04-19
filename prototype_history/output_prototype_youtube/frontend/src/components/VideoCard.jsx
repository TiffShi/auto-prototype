import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThumbnailUrl } from '../api/videoApi.js';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatViews(views) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} view${views !== 1 ? 's' : ''}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

export default function VideoCard({ video }) {
  const navigate = useNavigate();
  const [thumbError, setThumbError] = useState(false);
  const duration = formatDuration(video.duration);

  const handleClick = () => {
    navigate(`/video/${video.id}`);
  };

  return (
    <article className="video-card" onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Watch ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="video-card-thumbnail">
        {video.thumbnail_filename && !thumbError ? (
          <img
            src={getThumbnailUrl(video.id)}
            alt={`Thumbnail for ${video.title}`}
            onError={() => setThumbError(true)}
            loading="lazy"
          />
        ) : (
          <div className="thumbnail-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span>No thumbnail</span>
          </div>
        )}
        {duration && (
          <span className="video-duration-badge">{duration}</span>
        )}
      </div>

      {/* Info */}
      <div className="video-card-info">
        <h3 className="video-card-title" title={video.title}>
          {video.title}
        </h3>
        <div className="video-card-meta">
          <span>{formatViews(video.views)}</span>
          <span className="meta-dot" />
          <span>{formatDate(video.created_at)}</span>
        </div>
      </div>
    </article>
  );
}