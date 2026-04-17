import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlowerCard from '../components/FlowerCard.jsx';
import { FLOWERS } from '../data/flowers.js';
import '../styles/SelectionPage.css';

export default function SelectionPage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleEnter = () => {
    if (!selected) return;
    navigate('/garden', { state: { flowerType: selected } });
  };

  return (
    <div className="selection-page">
      <div className="selection-page__hero">
        <h1 className="selection-page__title">
          <span className="selection-page__title-icon">🌿</span>
          Blooming Garden
        </h1>
        <p className="selection-page__subtitle">
          Choose your flower and watch your garden come to life
        </p>
      </div>

      <div className="selection-page__grid" role="group" aria-label="Flower selection">
        {FLOWERS.map((flower) => (
          <FlowerCard
            key={flower.id}
            flower={flower}
            selected={selected === flower.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      <div className="selection-page__cta">
        <button
          className={`selection-page__enter-btn ${selected ? 'selection-page__enter-btn--active' : ''}`}
          onClick={handleEnter}
          disabled={!selected}
          aria-disabled={!selected}
        >
          {selected ? '✨ Enter the Garden' : 'Select a Flower First'}
        </button>
      </div>

      <p className="selection-page__hint">
        The longer you stay, the more your garden blooms
      </p>
    </div>
  );
}