import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createEngine } from '../game/engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants.js';
import HUD from './HUD.jsx';
import '../styles/game.css';

export default function GameCanvas({ startLevel = 1, onGameOver, onVictory }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(startLevel);
  const [paused, setPaused] = useState(false);

  const handleGameOver = useCallback((s, l) => {
    onGameOver?.(s, l);
  }, [onGameOver]);

  const handleVictory = useCallback((s, l) => {
    onVictory?.(s, l);
  }, [onVictory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createEngine(canvas, {
      startLevel,
      onScoreUpdate: setScore,
      onLivesUpdate: setLives,
      onLevelUpdate: setLevel,
      onGameOver: handleGameOver,
      onVictory: handleVictory,
    });

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
    };
  }, [startLevel, handleGameOver, handleVictory]);

  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.isPaused()) {
      engine.resume();
      setPaused(false);
    } else {
      engine.pause();
      setPaused(true);
    }
  }, []);

  // Pause on P key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePause]);

  return (
    <div className="game-wrapper">
      <HUD score={score} lives={lives} level={level} />
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
        />
        {paused && (
          <div className="pause-overlay">
            <div className="pause-content">
              <h2>PAUSED</h2>
              <p>Press P or ESC to resume</p>
              <button className="btn btn-primary" onClick={togglePause}>
                Resume
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="game-controls-hint">
        <span>WASD / Arrow Keys to move</span>
        <span>P / ESC to pause</span>
      </div>
    </div>
  );
}