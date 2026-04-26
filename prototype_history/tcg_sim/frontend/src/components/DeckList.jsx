import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeckList({ decks = [], onDelete, onSelect, selectedDeckId }) {
  const navigate = useNavigate();

  if (decks.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: '#6b7280',
          padding: '24px',
          fontStyle: 'italic',
        }}
      >
        No decks yet. Create one!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {decks.map((deck) => {
        const isSelected = selectedDeckId === deck.id;
        return (
          <div
            key={deck.id}
            style={{
              background: isSelected ? 'rgba(99,102,241,0.2)' : '#1a1a2e',
              border: `2px solid ${isSelected ? '#6366f1' : '#374151'}`,
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 'bold',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  marginBottom: '2px',
                }}
              >
                {deck.name}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {deck.total_cards} cards •{' '}
                {deck.total_cards >= 20 ? (
                  <span style={{ color: '#4ade80' }}>✓ Ready</span>
                ) : (
                  <span style={{ color: '#ef4444' }}>
                    Need {20 - deck.total_cards} more
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {onSelect && (
                <button
                  onClick={() => onSelect(deck)}
                  style={{
                    padding: '5px 10px',
                    background: isSelected ? '#6366f1' : '#374151',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {isSelected ? '✓ Selected' : 'Select'}
                </button>
              )}
              <button
                onClick={() => navigate(`/deck-builder/${deck.id}`)}
                style={{
                  padding: '5px 10px',
                  background: '#1e3a5f',
                  color: '#60a5fa',
                  border: '1px solid #1e40af',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Edit
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(deck.id)}
                  style={{
                    padding: '5px 10px',
                    background: '#3b1515',
                    color: '#ef4444',
                    border: '1px solid #7f1d1d',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}