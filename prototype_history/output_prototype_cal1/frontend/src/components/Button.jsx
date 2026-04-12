import React from 'react';

/**
 * Reusable calculator button component.
 *
 * @param {string} label       - Text shown on the button
 * @param {function} onClick   - Click handler
 * @param {string} variant     - Style variant: 'number' | 'operator' | 'action' | 'equals' | 'clear'
 * @param {boolean} disabled   - Whether the button is disabled
 * @param {string} ariaLabel   - Accessible label override
 */
function Button({ label, onClick, variant = 'number', disabled = false, ariaLabel, wide = false }) {
  const classNames = [
    'calc-btn',
    `calc-btn--${variant}`,
    wide ? 'calc-btn--wide' : '',
    disabled ? 'calc-btn--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      type="button"
    >
      {label}
    </button>
  );
}

export default Button;