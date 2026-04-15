import React, { useMemo } from 'react';
import NumberCell from './NumberCell.jsx';
import '../styles/PrimeGrid.css';

function PrimeGrid({ limit, primes }) {
  const numbers = useMemo(
    () => Array.from({ length: limit }, (_, i) => i + 1),
    [limit]
  );

  return (
    <div className="prime-grid-container">
      <div className="grid-legend">
        <div className="legend-item">
          <div className="legend-swatch prime-swatch" />
          <span>Prime</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch composite-swatch" />
          <span>Composite / 1</span>
        </div>
      </div>
      <div className="prime-grid" role="list" aria-label={`Number grid from 1 to ${limit}`}>
        {numbers.map((num) => (
          <NumberCell key={num} number={num} isPrime={primes.has(num)} />
        ))}
      </div>
    </div>
  );
}

export default PrimeGrid;