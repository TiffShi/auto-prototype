import React from 'react';
import '../styles/PrimeGrid.css';

function NumberCell({ number, isPrime }) {
  return (
    <div
      className={`number-cell ${isPrime ? 'prime' : 'composite'}`}
      role="listitem"
      title={isPrime ? `${number} is prime` : `${number} is not prime`}
      aria-label={`${number}${isPrime ? ', prime' : ''}`}
    >
      {number}
    </div>
  );
}

export default NumberCell;