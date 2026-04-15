import React from 'react';

function Display({ expression, result, isError, isLoading }) {
  const showResult = result !== '' || isLoading;

  return (
    <div className="display">
      {/* Expression row */}
      <div className="display__expression" aria-label="Expression">
        {expression || <span className="display__placeholder">0</span>}
      </div>

      {/* Result row */}
      <div
        className={`display__result ${isError ? 'display__result--error' : ''} ${
          showResult ? 'display__result--visible' : ''
        }`}
        aria-label="Result"
        aria-live="polite"
      >
        {isLoading ? (
          <span className="display__loading">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        ) : (
          result
        )}
      </div>
    </div>
  );
}

export default Display;