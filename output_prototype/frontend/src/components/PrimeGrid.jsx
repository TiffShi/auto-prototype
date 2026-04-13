import React, { useMemo } from 'react';
import NumberCell from './NumberCell.jsx';
import '../styles/PrimeGrid.css';

function PrimeGrid({ limit, primeSet }) {
  const numbers = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= limit; i++) {
      arr.push(i);
    }
    return arr;
  }, [limit]);

  if (!limit || limit === 0) return null;

  return (
    <div className="prime-grid-container">
      <div className="grid-legend">
        <span className="legend-item legend-prime">
          <span className="legend-swatch swatch-prime" /> Prime
        </span>
        <span className="legend-item legend-composite">
          <span className="legend-swatch swatch-composite" /> Composite
        </span>
        <span className="legend-item legend-special">
          <span className="legend-swatch swatch-special" /> Neither (1)
        </span>
      </div>
      <div
        className="prime-grid"
        role="grid"
        aria-label={`Number grid from 1 to ${limit}`}
      >
        {numbers.map((n) => (
          <NumberCell
            key={n}
            number={n}
            isPrime={primeSet.has(n)}
            isSpecial={n === 1}
          />
        ))}
      </div>
    </div>
  );
}

export default PrimeGrid;