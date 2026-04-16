import React, { useRef, useEffect } from 'react';
import LiveBadge from '../shared/LiveBadge.jsx';

export default function MediaPreview({ stream, isLive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="media-preview">
      <div className="media-preview-header">
        <span className="media-preview-label">Preview</span>
        {isLive && <LiveBadge />}
      </div>
      <div className="media-preview-video-wrap">
        {stream ? (
          <video
            ref={videoRef}
            className="media-preview-video"
            autoPlay
            muted
            playsInline
          />
        ) : (
          <div className="media-preview-placeholder">
            <span className="media-preview-placeholder-icon">📷</span>
            <p>No preview — select a source and go live</p>
          </div>
        )}
      </div>
    </div>
  );
}