import React from 'react';
import '../styles/SelectionPage.css';

export default function FlowerCard({ flower, selected, onSelect }) {
  return (
    <button
      className={`flower-card ${selected ? 'flower-card--selected' : ''}`}
      onClick={() => onSelect(flower.id)}
      aria-pressed={selected}
      aria-label={`Select ${flower.name}`}
      type="button"
    >
      <span className="flower-card__emoji" role="img" aria-hidden="true">
        {flower.emoji}
      </span>
      <span className="flower-card__name">{flower.name}</span>
      <span className="flower-card__desc">{flower.description}</span>
      {selected && <span className="flower-card__check">✓</span>}
    </button>
  );
}