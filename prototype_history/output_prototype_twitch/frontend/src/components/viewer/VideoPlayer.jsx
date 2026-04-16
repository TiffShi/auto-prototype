import React, { useRef, useEffect, useState } from 'react';
import FullscreenBtn from './FullscreenBtn.jsx';

export default function VideoPlayer({ stream, isFullscreen, onToggleFullscreen }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [stream]);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setIsMuted(v === 0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`video-player ${isFullscreen ? 'video-player--fullscreen' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {stream ? (
        <video
          ref={videoRef}
          className="video-player-video"
          autoPlay
          playsInline
          muted={isMuted}
        />
      ) : (
        <div className="video-player-waiting">
          <div className="video-player-spinner" />
          <p>Connecting to stream…</p>
        </div>
      )}

      <div className={`video-player-controls ${showControls ? 'visible' : ''}`}>
        <div className="video-player-controls-left">
          <button className="video-ctrl-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            className="video-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
          />
        </div>
        <div className="video-player-controls-right">
          <FullscreenBtn isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
        </div>
      </div>
    </div>
  );
}