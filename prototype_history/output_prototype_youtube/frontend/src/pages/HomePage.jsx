import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchVideos } from '../api/videoApi.js';
import VideoGrid from '../components/VideoGrid.jsx';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchVideos(0, 100);
        if (!cancelled) {
          setVideos(data.videos || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || err.message || 'Failed to load videos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadVideos();
    return () => { cancelled = true; };
  }, []);

  // Client-side search filtering
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q))
    );
  }, [videos, searchQuery]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-lg" />
        <p>Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2>Failed to load videos</h2>
        <p>{error}</p>
        <button className="btn-secondary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="home-header">
        <h1>
          {searchQuery ? (
            <>
              Results for <em style={{ color: 'var(--accent-red)', fontStyle: 'normal' }}>"{searchQuery}"</em>
            </>
          ) : (
            'All Videos'
          )}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {searchQuery && (
            <Link to="/" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              ✕ Clear search
            </Link>
          )}
          <span className="video-count-badge">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>
      </div>

      {filteredVideos.length === 0 && searchQuery ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h2>No results found</h2>
          <p>No videos match "{searchQuery}". Try a different search term.</p>
        </div>
      ) : (
        <VideoGrid videos={filteredVideos} />
      )}
    </div>
  );
}