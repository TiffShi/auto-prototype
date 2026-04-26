import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { fetchCards } from '../api/cardApi.js';

const RARITY_ORDER = { legendary: 0, rare: 1, uncommon: 2, common: 3 };

export default function CollectionPage() {
  const { token } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ type: 'all', rarity: 'all', search: '' });
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    try {
      const data = await fetchCards(token);
      setCards(data);
    } catch (e) {
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }

  const filtered = cards
    .filter((c) => {
      if (filter.type !== 'all' && c.type !== filter.type) return false;
      if (filter.rarity !== 'all' && c.rarity !== filter.rarity) return false;
      if (
        filter.search &&
        !c.name.toLowerCase().includes(filter.search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);

  const filterBtnStyle = (active) => ({
    padding: '5px 12px',
    background: active ? '#6366f1' : '#1a1a2e',
    color: active ? '#fff' : '#9ca3af',
    border: `1px solid ${active ? '#6366f1' : '#374151'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>
          📚 Card Collection
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '14px' }}>
          Browse all available cards in the game.
        </p>

        {/* Filters */}
        <div
          style={{
            background: '#1a1a2e',
            border: '1px solid #374151',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search cards..."
            value={filter.search}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
            style={{
              padding: '7px 12px',
              background: '#0f0f1a',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#e2e8f0',
              fontSize: '13px',
              outline: 'none',
              minWidth: '200px',
            }}
          />

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Type:</span>
            {['all', 'creature', 'spell'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter((f) => ({ ...f, type: t }))}
                style={filterBtnStyle(filter.type === t)}
              >
                {t === 'all' ? 'All' : t === 'creature' ? '⚔️ Creature' : '✨ Spell'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Rarity:</span>
            {['all', 'common', 'uncommon', 'rare', 'legendary'].map((r) => (
              <button
                key={r}
                onClick={() => setFilter((f) => ({ ...f, rarity: r }))}
                style={filterBtnStyle(filter.rarity === r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: 'auto' }}>
            {filtered.length} / {cards.length} cards
          </span>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '48px' }}>
            ⏳ Loading cards...
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '12px',
              color: '#ef4444',
              marginBottom: '16px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Card grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {filtered.map((card) => (
            <div key={card.id} onClick={() => setSelectedCard(card)}>
              <Card card={card} selected={selectedCard?.id === card.id} />
            </div>
          ))}
        </div>

        {/* Card detail panel */}
        {selectedCard && (
          <div
            style={{
              position: 'fixed',
              right: '24px',
              top: '80px',
              width: '280px',
              background: '#1a1a2e',
              border: '2px solid #6366f1',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 0 30px rgba(99,102,241,0.3)',
              zIndex: 50,
            }}
          >
            <button
              onClick={() => setSelectedCard(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ✕
            </button>
            <h3 style={{ color: '#e2e8f0', fontSize: '18px', marginBottom: '12px' }}>
              {selectedCard.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Type</span>
                <span style={{ color: '#e2e8f0', textTransform: 'capitalize' }}>
                  {selectedCard.type}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Rarity</span>
                <span style={{ color: '#fbbf24', textTransform: 'capitalize' }}>
                  {selectedCard.rarity}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Cost</span>
                <span style={{ color: '#ca8a04', fontWeight: 'bold' }}>
                  💎 {selectedCard.cost}
                </span>
              </div>
              {selectedCard.type === 'creature' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>Attack</span>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                      ⚔️ {selectedCard.attack}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>Defense</span>
                    <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>
                      🛡️ {selectedCard.defense}
                    </span>
                  </div>
                </>
              )}
              <div
                style={{
                  borderTop: '1px solid #374151',
                  paddingTop: '8px',
                  color: '#9ca3af',
                  fontStyle: 'italic',
                  lineHeight: '1.5',
                }}
              >
                {selectedCard.effect_text}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}