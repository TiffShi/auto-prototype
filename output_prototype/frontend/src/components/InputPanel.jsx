import React, { useState } from 'react';
import '../styles/InputPanel.css';

const MIN_LIMIT = 2;
const MAX_LIMIT = 1_000_000;

function InputPanel({ limit, setLimit, onVisualize, loading }) {
  const [validationError, setValidationError] = useState('');

  const validate = (value) => {
    if (value === '' || value === null) {
      return 'Please enter a number.';
    }
    const num = Number(value);
    if (!Number.isInteger(num) || isNaN(num)) {
      return 'Please enter a valid integer.';
    }
    if (num < MIN_LIMIT) {
      return `Minimum value is ${MIN_LIMIT}.`;
    }
    if (num > MAX_LIMIT) {
      return `Maximum value is ${MAX_LIMIT.toLocaleString()}.`;
    }
    return '';
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setLimit(val);
    if (validationError) {
      setValidationError(validate(val));
    }
  };

  const handleBlur = () => {
    setValidationError(validate(limit));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate(limit);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError('');
    onVisualize(Number(limit));
  };

  const numericLimit = Number(limit);
  const isDisabled =
    loading ||
    limit === '' ||
    !Number.isInteger(numericLimit) ||
    isNaN(numericLimit) ||
    numericLimit < MIN_LIMIT ||
    numericLimit > MAX_LIMIT;

  return (
    <div className="input-panel">
      <form className="input-form" onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <label htmlFor="limit-input" className="input-label">
            Enter a limit (2 – 1,000,000)
          </label>
          <div className="input-row">
            <input
              id="limit-input"
              type="number"
              className={`limit-input ${validationError ? 'input-error' : ''}`}
              value={limit}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 100"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step="1"
              disabled={loading}
              aria-describedby={validationError ? 'input-error-msg' : undefined}
            />
            <button
              type="submit"
              className="visualize-btn"
              disabled={isDisabled}
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
              {validationError}
            </p>
          )}
        </div>
      </form>

      <div className="quick-picks">
        <span className="quick-picks-label">Quick picks:</span>
        {[50, 100, 500, 1000, 10000].map((val) => (
          <button
            key={val}
            className="quick-pick-btn"
            onClick={() => {
              setLimit(String(val));
              setValidationError('');
              onVisualize(val);
            }}
            disabled={loading}
          >
            {val.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default InputPanel;