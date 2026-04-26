import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { fetchCards } from '../api/cardApi.js';
import { fetchDeck, createDeck, updateDeck } from '../api/deckApi.js';

const MIN_DECK_SIZE = 20;
const MAX_COPIES = 4;

export default function DeckBuilderPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [allCards, setAllCards] = useState([]);
  const [deckName, setDeckName] = useState('My Deck');
  const [deckCards, setDeckCards] = useState({}); // { card_id: quantity }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState({ type: 'all', search: '' });
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    loadData();
  }, [deckId]);

  async function loadData() {
    setLoading(true);
    try {
      const cards = await fetchCards(token);
      setAllCards(cards);

      if (deckId) {
        const deck = await fetchDeck(token, deckId);
        setDeckName(deck.name);
        const cardMap = {};
        deck.deck_cards.forEach((dc) => {
          cardMap[dc.card.id] = dc.quantity;
        });
        setDeckCards(cardMap);
      }
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function addCard(card) {
    setDeckCards((prev) => {
      const current = prev[card.id] || 0;
      if (current >= MAX_COPIES) return prev;
      return { ...prev, [card.id]: current + 1 };
    });
  }

  function removeCard(cardId) {
    setDeckCards((prev) => {
      const current = prev[cardId] || 0;
      if (current <= 0) return prev;
      if (current === 1) {
        const next = { ...prev };
        delete next[cardId];
        return next;
      }
      return { ...prev, [cardId]: current - 1 };
    });
  }

  function clearCard(cardId) {
    setDeckCards((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  }

  const totalCards = Object.values(deckCards).reduce((a, b) => a + b, 0);
  const isReady = totalCards >= MIN_DECK_SIZE;

  async function handleSave() {
    if (!deckName.trim()) {
      setError('Deck name is required');
      return;
    }
    if (!isReady) {
      setError(`Need at least ${MIN_DECK_SIZE} cards (have ${totalCards})`);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const cards = Object.entries(deckCards).map(([card_id, quantity]) => ({
      card_id: parseInt(card_id),
      quantity,
    }));

    try {
      if (deckId) {
        await updateDeck(token, deckId, deckName.trim(), cards);
        setSuccess('Deck updated successfully!');
      } else {
        await createDeck(token, deckName.trim(), cards);
        setSuccess('Deck created successfully!');
        setTimeout(() => navigate('/lobby'), 1500);
      }
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to save deck');
    } finally {
      setSaving(false);
    }
  }

  const filteredCards = allCards.filter((c) => {
    if (filter.type !== 'all' && c.type !== filter.type) return false;
    if (filter.search && !c.name.toLowerCase().includes(filter.search.toLowerCase()))
      return false;
    return true;
  });

  const deckCardList = allCards.filter((c) => deckCards[c.id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
        <Navbar />
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '80px' }}>
          ⏳ Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      <Navbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#e2e8f0' }}>
            🃏 {deckId ? 'Edit Deck' : 'Build New Deck'}
          </h1>
          <button
            onClick={() => navigate('/lobby')}
            style={{
              padding: '6px 14px',
              background: '#374151',
              color: '#9ca3af',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            ← Back
          </button>
        </div>

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
        {success && (
          <div
            style={{
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid #4ade80',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#4ade80',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            ✓ {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
          {/* Card browser */}
          <div>
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="🔍 Search..."
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
                  minWidth: '180px',
                }}
              />
              {['all', 'creature', 'spell'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter((f) => ({ ...f, type: t }))}
                  style={{
                    padding: '5px 12px',
                    background: filter.type === t ? '#6366f1' : '#1a1a2e',
                    color: filter.type === t ? '#fff' : '#9ca3af',
                    border: `1px solid ${filter.type === t ? '#6366f1' : '#374151'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {t === 'all' ? 'All' : t === 'creature' ? '⚔️ Creatures' : '✨ Spells'}
                </button>
              ))}
              <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: 'auto' }}>
                {filteredCards.length} cards
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {filteredCards.map((card) => {
                const count = deckCards[card.id] || 0;
                return (
                  <div key={card.id} style={{ position: 'relative' }}>
                    <Card
                      card={card}
                      onClick={() => addCard(card)}
                      selected={selectedCard?.id === card.id}
                      disabled={count >= MAX_COPIES}
                    />
                    {count > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#6366f1',
                          color: '#fff',
                          borderRadius: '10px',
                          padding: '1px 8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                        }}
                      >
                        ×{count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deck panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Deck name & save */}
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginBottom: '6px',
                }}
              >
                Deck Name
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#0f0f1a',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '12px',
                }}
              />

              {/* Progress */}
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginBottom: '4px',
                  }}
                >
                  <span>Cards</span>
                  <span style={{ color: isReady ? '#4ade80' : '#fbbf24' }}>
                    {totalCards} / {MIN_DECK_SIZE} min
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: '#374151',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (totalCards / MIN_DECK_SIZE) * 100)}%`,
                      height: '100%',
                      background: isReady ? '#4ade80' : '#fbbf24',
                      transition: 'width 0.3s',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !isReady}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: saving || !isReady ? '#374151' : '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving || !isReady ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {saving ? '⏳ Saving...' : deckId ? '💾 Update Deck' : '✨ Create Deck'}
              </button>
            </div>

            {/* Deck card list */}
            <div
              style={{
                background: '#1a1a2e',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '14px',
                flex: 1,
                maxHeight: '500px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#e2e8f0',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Deck Contents</span>
                <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>
                  {deckCardList.length} unique
                </span>
              </div>

              {deckCardList.length === 0 ? (
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '13px',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px',
                  }}
                >
                  Click cards to add them
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {deckCardList.map((card) => {
                    const qty = deckCards[card.id];
                    return (
                      <div
                        key={card.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          background: '#0f0f1a',
                          borderRadius: '6px',
                          border: '1px solid #1e293b',
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            background: card.type === 'creature' ? '#ef4444' : '#8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            flexShrink: 0,
                          }}
                        >
                          {card.type === 'creature' ? '⚔️' : '✨'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#e2e8f0',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {card.name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            Cost: {card.cost}
                            {card.type === 'creature' &&
                              ` • ${card.attack}/${card.defense}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => removeCard(card.id)}
                            style={{
                              width: '20px',
                              height: '20px',
                              background: '#374151',
                              color: '#e2e8f0',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontSize: '13px',
                              color: '#e2e8f0',
                              fontWeight: 'bold',
                              minWidth: '16px',
                              textAlign: 'center',
                            }}
                          >
                            {qty}
                          </span>
                          <button
                            onClick={() => addCard(card)}
                            disabled={qty >= MAX_COPIES}
                            style={{
                              width: '20px',
                              height: '20px',
                              background: qty >= MAX_COPIES ? '#1e293b' : '#374151',
                              color: qty >= MAX_COPIES ? '#4b5563' : '#e2e8f0',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: qty >= MAX_COPIES ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => clearCard(card.id)}
                            style={{
                              width: '20px',
                              height: '20px',
                              background: '#3b1515',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}