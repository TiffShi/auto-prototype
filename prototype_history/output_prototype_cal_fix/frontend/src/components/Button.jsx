import React from 'react';

/**
 * Reusable calculator button.
 *
 * @param {string}   label    - Text displayed on the button
 * @param {function} onClick  - Click handler
 * @param {string}   variant  - "number" | "operator" | "action" | "equals" | "zero"
 * @param {boolean}  disabled - Whether the button is disabled
 */
function Button({ label, onClick, variant = 'number', disabled = false }) {
  return (
    <button
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {label}
    </button>
  );
}

export default Button;