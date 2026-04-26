import React from 'react';
import Card from './Card.jsx';

export default function Hand({ cards = [], onPlayCard, isMyTurn, myMana, disabled = false }) {
  if (!cards || cards.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100px',
          color: '#6b7280',
          fontSize: '14px',
          fontStyle: 'italic',
        }}
      >
        No cards in hand
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 4px',
        alignItems: 'flex-end',
        minHeight: '200px',
      }}
    >
      {cards.map((card) => {
        const canPlay = isMyTurn && !disabled && myMana >= card.cost;
        return (
          <div
            key={card.instance_id}
            style={{
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              if (canPlay) e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Card
              card={card}
              onClick={() => canPlay && onPlayCard && onPlayCard(card)}
              disabled={!canPlay}
              selected={false}
            />
          </div>
        );
      })}
    </div>
  );
}