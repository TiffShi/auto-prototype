import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Garden from '../components/Garden.jsx';
import useGardenTimer from '../hooks/useGardenTimer.js';
import { getFlowerById } from '../data/flowers.js';
import api from '../api.js';
import '../styles/GardenPage.css';

export default function GardenPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const flowerType = location.state?.flowerType;
  const { elapsed, bloomCount, reset } = useGardenTimer();
  const sessionIdRef = useRef(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const flower = getFlowerById(flowerType);

  // Redirect if no flower selected
  useEffect(() => {
    if (!flowerType) {
      navigate('/', { replace: true });
    }
  }, [flowerType, navigate]);

  // Start backend session
  useEffect(() => {
    if (!flowerType) return;

    let cancelled = false;

    api
      .post('/api/session/start', { flower_type: flowerType })
      .then((res) => {
        if (!cancelled) {
          sessionIdRef.current = res.data.session_id;
          setSessionStarted(true);
        }
      })
      .catch((err) => {
        console.warn('Session start failed (non-critical):', err.message);
        setSessionStarted(true); // Still allow garden to work
      });

    return () => {
      cancelled = true;
    };
  }, [flowerType]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        api
          .delete(`/api/session/${sessionIdRef.current}`)
          .catch(() => {});
      }
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleChooseAgain = () => {
    reset();
    if (sessionIdRef.current) {
      api.delete(`/api/session/${sessionIdRef.current}`).catch(() => {});
      sessionIdRef.current = null;
    }
  };

  if (!flowerType) return null;

  return (
    <div className="garden-page">
      {/* Subtle HUD */}
      <div className="garden-page__hud">
        <Link
          to="/"
          className="garden-page__back-link"
          onClick={handleChooseAgain}
          aria-label="Choose a different flower"
        >
          ← Choose Again
        </Link>

        <div className="garden-page__stats">
          <span className="garden-page__flower-name">
            {flower.emoji} {flower.name}
          </span>
          <span className="garden-page__timer" aria-live="polite" aria-label={`Time: ${formatTime(elapsed)}`}>
            {formatTime(elapsed)}
          </span>
          <span className="garden-page__bloom-count" aria-live="polite">
            {bloomCount} {bloomCount === 1 ? 'bloom' : 'blooms'}
          </span>
        </div>
      </div>

      {/* Garden Canvas */}
      <Garden flowerType={flowerType} bloomCount={bloomCount} />

      {/* Ambient message */}
      {elapsed < 3 && (
        <div className="garden-page__welcome">
          <p>Your garden is awakening…</p>
        </div>
      )}
    </div>
  );
}