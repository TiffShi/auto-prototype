import React from 'react';
import styles from '../styles/ResultDisplay.module.css';

const SCALE_SYMBOLS = {
  Celsius: '°C',
  Fahrenheit: '°F',
  Kelvin: 'K',
};

const SCALE_COLORS = {
  Celsius: '#3b82f6',
  Fahrenheit: '#f97316',
  Kelvin: '#8b5cf6',
};

function formatNumber(num) {
  // Show up to 6 significant decimal places, strip trailing zeros
  const fixed = parseFloat(num.toFixed(6));
  return fixed.toLocaleString('en-US', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  });
}

export default function ResultDisplay({ result, error, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <span />
            <span />
            <span />
          </div>
          <p className={styles.loadingText}>Calculating conversion…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState} role="alert">
          <div className={styles.errorIconWrapper}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className={styles.errorContent}>
            <p className={styles.errorTitle}>Conversion Error</p>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
          </div>
          <p className={styles.emptyText}>
            Enter a value and press <strong>Convert</strong> to see the result
          </p>
        </div>
      </div>
    );
  }

  const fromSymbol = SCALE_SYMBOLS[result.from_scale] || '';
  const toSymbol = SCALE_SYMBOLS[result.to_scale] || '';
  const fromColor = SCALE_COLORS[result.from_scale] || '#6b7280';
  const toColor = SCALE_COLORS[result.to_scale] || '#6b7280';

  return (
    <div className={styles.container}>
      <div className={styles.resultState}>
        <p className={styles.resultLabel}>Conversion Result</p>

        <div className={styles.resultEquation}>
          {/* Input side */}
          <div className={styles.tempBlock}>
            <span
              className={styles.tempValue}
              style={{ color: fromColor }}
            >
              {formatNumber(result.input_value)}
            </span>
            <span
              className={styles.tempUnit}
              style={{ color: fromColor }}
            >
              {fromSymbol}
            </span>
            <span className={styles.scaleName}>{result.from_scale}</span>
          </div>

          {/* Equals sign */}
          <div className={styles.equalsSign}>=</div>

          {/* Output side */}
          <div className={styles.tempBlock}>
            <span
              className={styles.tempValue}
              style={{ color: toColor }}
            >
              {formatNumber(result.result)}
            </span>
            <span
              className={styles.tempUnit}
              style={{ color: toColor }}
            >
              {toSymbol}
            </span>
            <span className={styles.scaleName}>{result.to_scale}</span>
          </div>
        </div>

        {/* Formatted string */}
        <div className={styles.resultString}>
          <code>
            {formatNumber(result.input_value)}&nbsp;{fromSymbol}&nbsp;=&nbsp;
            {formatNumber(result.result)}&nbsp;{toSymbol}
          </code>
        </div>
      </div>
    </div>
  );
}