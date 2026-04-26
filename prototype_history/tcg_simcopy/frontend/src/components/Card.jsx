import React from 'react';

const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  legendary: '#fbbf24',
};

const TYPE_COLORS = {
  creature: '#ef4444',
  spell: '#8b5cf6',
};

export default function Card({
  card,
  onClick,
  selected = false,
  disabled = false,
  compact = false,
  showCount = null,
}) {
  if (!card) return null;

  const rarityColor = RARITY_COLORS[card.rarity] || '#9ca3af';
  const typeColor = TYPE_COLORS[card.type] || '#6b7280';

  const handleClick = () => {
    if (!disabled && onClick) onClick(card);
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        style={{
          border: `2px solid ${selected ? '#fbbf24' : rarityColor}`,
          borderRadius: '8px',
          padding: '8px',
          background: selected ? '#1e1b4b' : '#1a1a2e',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          minWidth: '160px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            background: typeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#fff',
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          {card.cost}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#e2e8f0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.name}
          </div>
          <div style={{ fontSize: '10px', color: rarityColor }}>
            {card.type === 'creature' ? `${card.attack}/${card.defense}` : 'Spell'}
          </div>
        </div>
        {showCount !== null && (
          <div
            style={{
              background: '#374151',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#e2e8f0',
              flexShrink: 0,
            }}
          >
            {showCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      style={{
        width: '130px',
        minHeight: '180px',
        border: `2px solid ${selected ? '#fbbf24' : rarityColor}`,
        borderRadius: '10px',
        background: selected ? '#1e1b4b' : '#1a1a2e',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s',
        boxShadow: selected ? `0 0 12px ${rarityColor}` : '0 2px 8px rgba(0,0,0,0.4)',
        transform: selected ? 'translateY(-4px)' : 'none',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Cost badge */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#ca8a04',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#000',
          zIndex: 1,
        }}
      >
        {card.cost}
      </div>

      {/* Card image */}
      <div
        style={{
          height: '90px',
          background: card.image_url
            ? `url(${card.image_url}) center/cover no-repeat`
            : typeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {!card.image_url && (
          <span style={{ fontSize: '28px' }}>
            {card.type === 'creature' ? '⚔️' : '✨'}
          </span>
        )}
      </div>

      {/* Card name */}
      <div
        style={{
          padding: '4px 6px',
          background: '#111827',
          borderTop: `1px solid ${rarityColor}`,
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#e2e8f0',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {card.name}
        </div>
      </div>

      {/* Type & rarity */}
      <div
        style={{
          padding: '2px 6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            color: typeColor,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {card.type}
        </span>
        <span style={{ fontSize: '9px', color: rarityColor, textTransform: 'uppercase' }}>
          {card.rarity}
        </span>
      </div>

      {/* Effect text */}
      <div
        style={{
          padding: '2px 6px',
          fontSize: '9px',
          color: '#9ca3af',
          textAlign: 'center',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {card.effect_text}
      </div>

      {/* Stats */}
      {card.type === 'creature' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '4px 8px',
            background: '#111827',
            borderTop: '1px solid #374151',
          }}
        >
          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>
            ⚔️ {card.attack}
          </span>
          <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>
            🛡️ {card.defense}
          </span>
        </div>
      )}
    </div>
  );
}