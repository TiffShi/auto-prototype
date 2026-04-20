import React, { useState, useCallback } from 'react';
import { submitScore } from '../api/scores.js';
import '../styles/App.css';

export default function GameOver({ score, level, onRestart, onBack }) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name.');
      return;
    }
    if (trimmed.length > 32) {
      setError('Name must be 32 characters or less.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitScore(trimmed, score, level);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [name, score, level]);

  return (
    <div className="game-over-screen">
      <div className="game-over-content">
        <h1 className="game-over-title">GAME OVER</h1>

        <div className="final-stats">
          <div className="stat-row">
            <span className="stat-label">FINAL SCORE</span>
            <span className="stat-value score-value">{score.toLocaleString()}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">LEVEL REACHED</span>
            <span className="stat-value">{level}</span>
          </div>
        </div>

        {!submitted ? (
          <form className="score-form" onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="player-name">
              ENTER YOUR NAME
            </label>
            <input
              id="player-name"
              type="text"
              className="name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={32}
              placeholder="YOUR NAME"
              autoFocus
              disabled={submitting}
            />
            {error && <p className="form-error">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'SUBMITTING…' : 'SUBMIT SCORE'}
            </button>
          </form>
        ) : (
          <div className="submit-success">
            <p className="success-text">✓ Score submitted!</p>
          </div>
        )}

        <div className="game-over-buttons">
          <button className="btn btn-primary" onClick={onRestart}>
            PLAY AGAIN
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}