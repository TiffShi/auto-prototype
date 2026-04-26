import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore, useAuthStore } from '../store/gameStore.js';
import { useGameSocket } from '../hooks/useGameSocket.js';
import PlayerStats from '../components/PlayerStats.jsx';
import Battlefield from '../components/Battlefield.jsx';
import Hand from '../components/Hand.jsx';
import GameLog from '../components/GameLog.jsx';

export default function GamePage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const {
    gameState,
    myPlayerKey,
    isMyTurn,
    gameLog,
    winner,
    connectionStatus,
    errorMessage,
    setRoomCode,
    resetGame,
  } = useGameStore();

  const { playCard, attackAction, endTurn } = useGameSocket(roomCode);

  const [selectedAttacker, setSelectedAttacker] = useState(null);
  const [attackMode, setAttackMode] = useState(false);

  useEffect(() => {
    setRoomCode(roomCode);
    return () => {
      // Don't reset on unmount to preserve state if navigating back
    };
  }, [roomCode]);

  // Clear attacker selection when turn changes
  useEffect(() => {
    setSelectedAttacker(null);
    setAttackMode(false);
  }, [isMyTurn]);

  const myState = gameState?.[myPlayerKey];
  const opponentKey = myPlayerKey === 'player1' ? 'player2' : 'player1';
  const opponentState = gameState?.[opponentKey];

  function handlePlayCard(card) {
    if (!isMyTurn) return;
    playCard(card.instance_id, null);
  }

  function handleAttack(attackerId, targetId) {
    attackAction(attackerId, targetId);
  }

  function handleEndTurn() {
    setSelectedAttacker(null);
    setAttackMode(false);
    endTurn();
  }

  function handleLeave() {
    resetGame();
    navigate('/lobby');
  }

  const statusColors = {
    connected: '#4ade80',
    connecting: '#fbbf24',
    waiting: '#60a5fa',
    disconnected: '#ef4444',
    error: '#ef4444',
  };

  // Game over screen
  if (winner && gameState?.status === 'finished') {
    const winnerState = gameState[winner];
    const isWinner = winnerState?.user_id === user?.id;

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f0f1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: '#1a1a2e',
            border: `3px solid ${isWinner ? '#fbbf24' : '#ef4444'}`,
            borderRadius: '20px',
            padding: '48px',
            textAlign: 'center',
            maxWidth: '480px',
            boxShadow: `0 0 60px ${isWinner ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '16px' }}>
            {isWinner ? '🏆' : '💀'}
          </div>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: isWinner ? '#fbbf24' : '#ef4444',
              marginBottom: '8px',
            }}
          >
            {isWinner ? 'Victory!' : 'Defeat!'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '8px' }}>
            {winnerState?.username} wins the game!
          </p>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '32px' }}>
            Turn {gameState.turn_number} • Room: {roomCode}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleLeave}
              style={{
                padding: '12px 28px',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 'bold',
              }}
            >
              🏠 Back to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f1a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: '#0f0f1a',
          borderBottom: '1px solid #1e293b',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '16px' }}>
          ⚔️ TCG
        </span>
        <span style={{ color: '#6b7280', fontSize: '13px' }}>Room: {roomCode}</span>

        {/* Connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: statusColors[connectionStatus] || '#6b7280',
            }}
          />
          <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'capitalize' }}>
            {connectionStatus}
          </span>
        </div>

        {gameState && (
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            Turn {gameState.turn_number}
          </span>
        )}

        <div style={{ flex: 1 }} />

        {isMyTurn && gameState?.status === 'active' && (
          <div
            style={{
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid #6366f1',
              borderRadius: '6px',
              padding: '4px 12px',
              color: '#a5b4fc',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            ✨ Your Turn
          </div>
        )}

        <button
          onClick={handleLeave}
          style={{
            padding: '5px 12px',
            background: '#3b1515',
            color: '#ef4444',
            border: '1px solid #7f1d1d',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Leave
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid #ef4444',
            padding: '8px 16px',
            color: '#ef4444',
            fontSize: '13px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Waiting state */}
      {connectionStatus === 'waiting' && !gameState && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '64px' }}>⏳</div>
          <h2 style={{ color: '#e2e8f0', fontSize: '24px' }}>Waiting for Opponent</h2>
          <p style={{ color: '#9ca3af' }}>Share the room code with your opponent:</p>
          <div
            style={{
              background: '#1a1a2e',
              border: '2px solid #6366f1',
              borderRadius: '10px',
              padding: '16px 32px',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#fbbf24',
              letterSpacing: '8px',
              fontFamily: 'monospace',
            }}
          >
            {roomCode}
          </div>
        </div>
      )}

      {/* Game board */}
      {gameState && (
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gridTemplateRows: 'auto 1fr auto auto',
            gap: '8px',
            padding: '8px 12px',
            overflow: 'hidden',
          }}
        >
          {/* Opponent stats */}
          <div style={{ gridColumn: '1', gridRow: '1' }}>
            <PlayerStats
              player={opponentState}
              isOpponent={true}
              isActive={!isMyTurn}
            />
          </div>

          {/* Battlefield */}
          <div style={{ gridColumn: '1', gridRow: '2', overflow: 'hidden' }}>
            <Battlefield
              myField={myState?.field || []}
              opponentField={opponentState?.field || []}
              onAttack={handleAttack}
              selectedAttacker={selectedAttacker}
              setSelectedAttacker={setSelectedAttacker}
              isMyTurn={isMyTurn}
              disabled={gameState?.status !== 'active'}
            />
          </div>

          {/* My stats */}
          <div style={{ gridColumn: '1', gridRow: '3' }}>
            <PlayerStats
              player={myState}
              isOpponent={false}
              isActive={isMyTurn}
            />
          </div>

          {/* My hand */}
          <div
            style={{
              gridColumn: '1',
              gridRow: '4',
              background: 'rgba(17,24,39,0.6)',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '8px',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#6b7280',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>🃏 Your Hand ({myState?.hand?.length || 0} cards)</span>
              {selectedAttacker && (
                <span style={{ color: '#fbbf24' }}>
                  ⚔️ {selectedAttacker.name} selected — click a target
                </span>
              )}
            </div>
            <Hand
              cards={myState?.hand || []}
              onPlayCard={handlePlayCard}
              isMyTurn={isMyTurn}
              myMana={myState?.mana || 0}
              disabled={gameState?.status !== 'active'}
            />
          </div>

          {/* Right panel: log + controls */}
          <div
            style={{
              gridColumn: '2',
              gridRow: '1 / 5',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Turn controls */}
            {isMyTurn && gameState?.status === 'active' && (
              <div
                style={{
                  background: '#1a1a2e',
                  border: '1px solid #374151',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginBottom: '10px',
                    textAlign: 'center',
                  }}
                >
                  Your turn — Mana: {myState?.mana}/{myState?.max_mana}
                </div>

                {selectedAttacker && (
                  <div
                    style={{
                      background: 'rgba(251,191,36,0.1)',
                      border: '1px solid #fbbf24',
                      borderRadius: '6px',
                      padding: '8px',
                      marginBottom: '8px',
                      fontSize: '12px',
                      color: '#fbbf24',
                      textAlign: 'center',
                    }}
                  >
                    ⚔️ {selectedAttacker.name} ready to attack
                    <br />
                    <button
                      onClick={() => setSelectedAttacker(null)}
                      style={{
                        marginTop: '4px',
                        padding: '2px 8px',
                        background: '#374151',
                        color: '#9ca3af',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <button
                  onClick={handleEndTurn}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  ⏭️ End Turn
                </button>
              </div>
            )}

            {!isMyTurn && gameState?.status === 'active' && (
              <div
                style={{
                  background: '#1a1a2e',
                  border: '1px solid #374151',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>⏳</div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                  Waiting for {opponentState?.username}...
                </div>
              </div>
            )}

            {/* Game instructions */}
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '11px',
                color: '#6b7280',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#9ca3af', marginBottom: '6px' }}>
                How to Play
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>🃏 Click hand cards to play them</div>
                <div>⚔️ Click your creature to select attacker</div>
                <div>🎯 Click opponent creature to attack</div>
                <div>💥 Click empty field for direct attack</div>
                <div>😴 New creatures can't attack first turn</div>
                <div>🏆 Reduce opponent HP to 0 to win</div>
              </div>
            </div>

            {/* Game log */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <GameLog logs={gameLog} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}