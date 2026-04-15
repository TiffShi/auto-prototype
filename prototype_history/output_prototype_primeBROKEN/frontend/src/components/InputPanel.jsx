import React, { useState } from 'react';
import '../styles/InputPanel.css';

function InputPanel({ onVisualize, loading }) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState('');

  const validate = (value) => {
    if (value.trim() === '') {
      return 'Please enter a number.';
    }
    if (!/^\d+$/.test(value.trim())) {
      return 'Please enter a valid whole number (no decimals or symbols).';
    }
    const num = parseInt(value.trim(), 10);
    if (num < 2) {
      return 'The limit must be at least 2.';
    }
    if (num > 1_000_000) {
      return 'The limit must not exceed 1,000,000.';
    }
    return '';
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errorMsg = validate(inputValue);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }
    setValidationError('');
    onVisualize(parseInt(inputValue.trim(), 10));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="input-panel">
      <form className="input-form" onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <label htmlFor="limit-input" className="input-label">
            Enter Upper Limit
          </label>
          <div className="input-row">
            <input
              id="limit-input"
              type="number"
              className={`limit-input ${validationError ? 'input-error' : ''}`}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 100"
              min="2"
              max="1000000"
              disabled={loading}
              aria-describedby={validationError ? 'input-error-msg' : undefined}
              aria-invalid={!!validationError}
            />
            <button
              type="submit"
              className="visualize-btn"
              disabled={loading}
              aria-label="Visualize primes"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" />
                  Computing…
                </span>
              ) : (
                'Visualize'
              )}
            </button>
          </div>
          {validationError && (
            <p id="input-error-msg" className="validation-error" role="alert">
              <span className="error-icon-sm">⚠</span> {validationError}
            </p>
          )}
          <p className="input-hint">Enter a whole number between 2 and 1,000,000</p>
        </div>
      </form>

      <div className="quick-picks">
        <span className="quick-picks-label">Quick picks:</span>
        {[50, 100, 200, 500, 1000].map((val) => (
          <button
            key={val}
            className="quick-pick-btn"
            onClick={() => {
              setInputValue(String(val));
              setValidationError('');
              onVisualize(val);
            }}
            disabled={loading}
            type="button"
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}

export default InputPanel;