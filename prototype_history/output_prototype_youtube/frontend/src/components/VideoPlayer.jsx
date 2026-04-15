import React, { useRef, useEffect, useCallback } from 'react';
import { getStreamUrl } from '../api/videoApi.js';

export default function VideoPlayer({ videoId, onPlay }) {
  const videoRef = useRef(null);
  const hasTrackedView = useRef(false);

  const handlePlay = useCallback(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      onPlay && onPlay();
    }
  }, [onPlay]);

  // Reset view tracking when video changes
  useEffect(() => {
    hasTrackedView.current = false;
  }, [videoId]);

  const streamUrl = getStreamUrl(videoId);

  return (
    <video
      ref={videoRef}
      controls
      preload="metadata"
      onPlay={handlePlay}
      style={{ width: '100%', height: '100%', display: 'block', backgroundColor: '#000' }}
    >
      <source src={streamUrl} />
      Your browser does not support the video tag.
    </video>
  );
}