import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import DeckList from '../components/DeckList.jsx';
import RoomCodeModal from '../components/RoomCodeModal.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { fetchDecks, deleteDeck } from '../api/deckApi.js';
import { createGame, joinGame } from '../api/gameApi.js';

export default function LobbyPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  async function loadDecks() {
    try {
      const data = await fetchDecks(token);
      setDecks(data);
    } catch (e) {
      setError('Failed to load decks');
    }
  }

  async function handleDeleteDeck(deckId) {
    if (!confirm('Delete this deck?')) return;
    try {
      await deleteDeck(token, deckId);
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      if (selectedDeckId === deckId) setSelectedDeckId(null);
    } catch (e) {
      setError('Failed to delete deck');
    }
  }

  async function handleCreateGame() {
    if (!selectedDeckId) {
      setError('Please select a deck first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const room = await createGame(token, selectedDeckId);
      setCreatedRoomCode(room.room_code);
      setShowModal(true);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame() {
    if (!selectedDeckId) {
      setError('Please select a deck first');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const room = await joinGame(token, joinCode.trim().toUpperCase(), selectedDeckId);
      navigate(`/game/${room.room_code}`);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  }

  function handleModalClose() {
    setShowModal(false);
    if (createdRoomCode) {
      navigate(`/game/${createdRoomCode}`);
    }
  }

  const readyDecks = decks.filter((d) => d.total_cards >= 20);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      <Navbar />

      {showModal && createdRoomCode && (
        <RoomCodeModal roomCode={createdRoomCode} onClose={handleModalClose} />
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#e2e8f0',
            marginBottom: '8px',
          }}
        >
          🏠 Game Lobby
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '14px' }}>
          Select a deck and create or join a game room.
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          {/* Deck selection */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h2 style={{ color: '#e2e8f0', fontSize: '18px' }}>Your Decks</h2>
              <button
                onClick={() => navigate('/deck-builder')}
                style={{
                  padding: '6px 14px',
                  background: '#1e3a5f',
                  color: '#60a5fa',
                  border: '1px solid #1e40af',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                + New Deck
              </button>
            </div>

            {decks.length === 0 ? (
              <div
                style={{
                  background: '#1a1a2e',
                  border: '1px dashed #374151',
                  borderRadius: '10px',
                  padding: '32px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🃏</div>
                <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
                  You don't have any decks yet.
                </p>
                <button
                  onClick={() => navigate('/deck-builder')}
                  style={{
                    padding: '10px 20px',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Build Your First Deck
                </button>
              </div>
            ) : (
              <DeckList
                decks={decks}
                onDelete={handleDeleteDeck}
                onSelect={(deck) =>
                  setSelectedDeckId(deck.id === selectedDeckId ? null : deck.id)
                }
                selectedDeckId={selectedDeckId}
              />
            )}
          </div>

          {/* Game actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Selected deck info */}
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <h3 style={{ color: '#e2e8f0', fontSize: '15px', marginBottom: '8px' }}>
                Selected Deck
              </h3>
              {selectedDeckId ? (
                (() => {
                  const deck = decks.find((d) => d.id === selectedDeckId);
                  return deck ? (
                    <div>
                      <div style={{ color: '#a5b4fc', fontWeight: 'bold' }}>{deck.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                        {deck.total_cards} cards
                      </div>
                    </div>
                  ) : null;
                })()
              ) : (
                <div style={{ color: '#6b7280', fontSize: '13px', fontStyle: 'italic' }}>
                  No deck selected
                </div>
              )}
            </div>

            {/* Create game */}
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <h3 style={{ color: '#e2e8f0', fontSize: '15px', marginBottom: '12px' }}>
                🎮 Create Game
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>
                Create a room and share the code with your opponent.
              </p>
              <button
                onClick={handleCreateGame}
                disabled={loading || !selectedDeckId}
                style={{
                  width: '100%',
                  padding: '10px',
                  background:
                    loading || !selectedDeckId ? '#374151' : '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !selectedDeckId ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {loading ? '⏳ Creating...' : '🚀 Create Room'}
              </button>
              {!selectedDeckId && (
                <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>
                  Select a deck to continue
                </p>
              )}
            </div>

            {/* Join game */}
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <h3 style={{ color: '#e2e8f0', fontSize: '15px', marginBottom: '12px' }}>
                🔗 Join Game
              </h3>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter room code..."
                maxLength={8}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0f0f1a',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  letterSpacing: '4px',
                  textAlign: 'center',
                  outline: 'none',
                  marginBottom: '10px',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = '#374151')}
              />
              <button
                onClick={handleJoinGame}
                disabled={loading || !selectedDeckId || !joinCode.trim()}
                style={{
                  width: '100%',
                  padding: '10px',
                  background:
                    loading || !selectedDeckId || !joinCode.trim()
                      ? '#374151'
                      : '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor:
                    loading || !selectedDeckId || !joinCode.trim()
                      ? 'not-allowed'
                      : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {loading ? '⏳ Joining...' : '🔗 Join Room'}
              </button>
            </div>

            {/* Quick stats */}
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <h3 style={{ color: '#e2e8f0', fontSize: '14px', marginBottom: '8px' }}>
                📊 Your Stats
              </h3>
              <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Total Decks: <strong style={{ color: '#e2e8f0' }}>{decks.length}</strong></div>
                <div>
                  Ready Decks:{' '}
                  <strong style={{ color: '#4ade80' }}>{readyDecks.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}