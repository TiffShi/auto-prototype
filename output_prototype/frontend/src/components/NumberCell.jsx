import React from 'react';
import '../styles/NumberCell.css';

function NumberCell({ number, isPrime, isSpecial }) {
  let cellClass = 'number-cell';
  let label = '';

  if (isSpecial) {
    cellClass += ' cell-special';
    label = '1 (neither prime nor composite)';
  } else if (isPrime) {
    cellClass += ' cell-prime';
    label = `${number} is prime`;
  } else {
    cellClass += ' cell-composite';
    label = `${number} is composite`;
  }

  return (
    <div
      className={cellClass}
      role="gridcell"
      aria-label={label}
      title={label}
    >
      {number}
    </div>
  );
}

export default NumberCell;