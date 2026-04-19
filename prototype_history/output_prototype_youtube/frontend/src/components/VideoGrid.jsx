import React from 'react';
import VideoCard from './VideoCard.jsx';

export default function VideoGrid({ videos }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
          <path d="M10 10l4-2-4-2v4z" />
        </svg>
        <h2>No videos yet</h2>
        <p>Be the first to upload a video and share it with the world!</p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}