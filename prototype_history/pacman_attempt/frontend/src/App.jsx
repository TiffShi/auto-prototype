import React, { useState, useCallback } from 'react';
import StartScreen from './components/StartScreen.jsx';
import GameCanvas from './components/GameCanvas.jsx';
import GameOver from './components/GameOver.jsx';
import './styles/App.css';

export const GAME_STATES = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
};

export default function App() {
  const [gameState, setGameState] = useState(GAME_STATES.START);
  const [finalScore, setFinalScore] = useState(0);
  const [finalLevel, setFinalLevel] = useState(1);
  const [startLevel, setStartLevel] = useState(1);

  const handleStart = useCallback(() => {
    setStartLevel(1);
    setGameState(GAME_STATES.PLAYING);
  }, []);

  const handleGameOver = useCallback((score, level) => {
    setFinalScore(score);
    setFinalLevel(level);
    setGameState(GAME_STATES.GAME_OVER);
  }, []);

  const handleVictory = useCallback((score, level) => {
    setFinalScore(score);
    setFinalLevel(level);
    setStartLevel(level + 1);
    setGameState(GAME_STATES.VICTORY);
  }, []);

  const handleNextLevel = useCallback(() => {
    setGameState(GAME_STATES.PLAYING);
  }, []);

  const handleBackToStart = useCallback(() => {
    setGameState(GAME_STATES.START);
  }, []);

  return (
    <div className="app-container">
      {gameState === GAME_STATES.START && (
        <StartScreen onStart={handleStart} />
      )}

      {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) && (
        <GameCanvas
          key={startLevel}
          startLevel={startLevel}
          onGameOver={handleGameOver}
          onVictory={handleVictory}
        />
      )}

      {gameState === GAME_STATES.GAME_OVER && (
        <GameOver
          score={finalScore}
          level={finalLevel}
          onRestart={handleStart}
          onBack={handleBackToStart}
        />
      )}

      {gameState === GAME_STATES.VICTORY && (
        <div className="victory-screen">
          <div className="victory-content">
            <h1 className="victory-title">LEVEL CLEAR!</h1>
            <p className="victory-score">Score: {finalScore}</p>
            <p className="victory-level">Level {finalLevel} Complete!</p>
            <div className="victory-buttons">
              <button className="btn btn-primary" onClick={handleNextLevel}>
                Next Level
              </button>
              <button className="btn btn-secondary" onClick={handleBackToStart}>
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}