import React from 'react';

/**
 * Display component — shows the current expression and result/error.
 */
function Display({ expression, display, error, isLoading, justEvaluated }) {
  const displayValue = isLoading ? 'Calculating...' : display;

  const displayClass = [
    'display__value',
    error ? 'display__value--error' : '',
    isLoading ? 'display__value--loading' : '',
    justEvaluated ? 'display__value--result' : '',
    displayValue.length > 12 ? 'display__value--small' : '',
    displayValue.length > 16 ? 'display__value--xsmall' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="display" role="region" aria-label="Calculator display">
      {/* Expression row */}
      <div className="display__expression" aria-label="Current expression">
        {expression || '\u00A0'}
      </div>

      {/* Main value / result row */}
      <div className={displayClass} aria-label="Display value" aria-live="polite">
        {error ? (
          <span className="display__error-text" title={error}>
            {error.length > 22 ? error.slice(0, 22) + '…' : error}
          </span>
        ) : (
          displayValue
        )}
      </div>
    </div>
  );
}

export default Display;