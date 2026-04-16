import React from 'react';
import { useNavigate } from 'react-router-dom';
import LiveBadge from '../components/shared/LiveBadge.jsx';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-hero-content">
          <div className="home-logo">
            <span className="home-logo-icon">📡</span>
            <h1 className="home-title">LocalStream</h1>
          </div>
          <p className="home-subtitle">
            Broadcast and watch live streams on your local network — no internet required.
          </p>
          <LiveBadge pulse />
        </div>
      </div>

      <div className="home-cards">
        <button
          className="home-card home-card--broadcast"
          onClick={() => navigate('/broadcast')}
        >
          <div className="home-card-icon">🎙️</div>
          <h2 className="home-card-title">Go Live</h2>
          <p className="home-card-desc">
            Share your screen or webcam with everyone on the network. Set up your stream
            title and start broadcasting instantly.
          </p>
          <span className="home-card-cta">Start Broadcasting →</span>
        </button>

        <button
          className="home-card home-card--watch"
          onClick={() => navigate('/streams')}
        >
          <div className="home-card-icon">📺</div>
          <h2 className="home-card-title">Watch Streams</h2>
          <p className="home-card-desc">
            Browse live streams happening right now on your local network. Join and chat
            with other viewers in real time.
          </p>
          <span className="home-card-cta">Browse Streams →</span>
        </button>
      </div>

      <div className="home-features">
        <div className="home-feature">
          <span className="home-feature-icon">⚡</span>
          <span>Ultra-low latency WebRTC</span>
        </div>
        <div className="home-feature">
          <span className="home-feature-icon">💬</span>
          <span>Real-time chat</span>
        </div>
        <div className="home-feature">
          <span className="home-feature-icon">🔒</span>
          <span>Local network only</span>
        </div>
        <div className="home-feature">
          <span className="home-feature-icon">🖥️</span>
          <span>Screen & webcam capture</span>
        </div>
      </div>
    </div>
  );
}