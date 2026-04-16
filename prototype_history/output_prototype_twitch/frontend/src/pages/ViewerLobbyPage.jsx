import React, { useEffect, useCallback } from 'react';
import { useStreamContext } from '../context/StreamContext.jsx';
import StreamCard from '../components/viewer/StreamCard.jsx';
import '../styles/viewer.css';

export default function ViewerLobbyPage() {
  const { streams, isLoading, error, fetchStreams } = useStreamContext();

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 5000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  return (
    <div className="lobby-page">
      <div className="lobby-header">
        <h1 className="lobby-title">Live Streams</h1>
        <button className="lobby-refresh-btn" onClick={fetchStreams} disabled={isLoading}>
          {isLoading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      {error && (
        <div className="lobby-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {!isLoading && streams.length === 0 && !error && (
        <div className="lobby-empty">
          <div className="lobby-empty-icon">📡</div>
          <h2>No Live Streams</h2>
          <p>Nobody is broadcasting right now. Be the first to go live!</p>
        </div>
      )}

      {isLoading && streams.length === 0 && (
        <div className="lobby-loading">
          <div className="lobby-spinner" />
          <p>Looking for streams...</p>
        </div>
      )}

      <div className="lobby-grid">
        {streams.map((stream) => (
          <StreamCard key={stream.stream_id} stream={stream} />
        ))}
      </div>
    </div>
  );
}