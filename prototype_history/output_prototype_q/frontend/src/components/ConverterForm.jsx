import React, { useState } from 'react';
import ScaleDropdown from './ScaleDropdown.jsx';
import { convertTemperature } from '../api/convertApi.js';
import styles from '../styles/ConverterForm.module.css';

export default function ConverterForm({ onResult, onError, onLoading, isLoading }) {
  const [inputValue, setInputValue] = useState('');
  const [fromScale, setFromScale] = useState('Celsius');
  const [toScale, setToScale] = useState('Fahrenheit');
  const [inputError, setInputError] = useState('');

  const validateInput = (val) => {
    if (val.trim() === '') {
      return 'Please enter a temperature value.';
    }
    if (isNaN(Number(val))) {
      return 'Please enter a valid numeric value.';
    }
    return '';
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (inputError) {
      setInputError('');
    }
  };

  const handleSwapScales = () => {
    setFromScale(toScale);
    setToScale(fromScale);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateInput(inputValue);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    setInputError('');
    onLoading(true);

    try {
      const data = await convertTemperature({
        value: inputValue,
        fromScale,
        toScale,
      });
      onResult(data);
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  const isSameScale = fromScale === toScale;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Temperature Input */}
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="tempInput">
          Temperature Value
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="tempInput"
            type="number"
            className={`${styles.input} ${inputError ? styles.inputError : ''}`}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="e.g. 100, -40, 0.5"
            disabled={isLoading}
            step="any"
            aria-describedby={inputError ? 'inputErrorMsg' : undefined}
          />
          {inputError && (
            <span className={styles.errorIcon} aria-hidden="true">
              ⚠
            </span>
          )}
        </div>
        {inputError && (
          <p id="inputErrorMsg" className={styles.fieldError} role="alert">
            {inputError}
          </p>
        )}
      </div>

      {/* Scale Selectors */}
      <div className={styles.scalesRow}>
        <ScaleDropdown
          label="From Scale"
          value={fromScale}
          onChange={setFromScale}
          disabled={isLoading}
        />

        <button
          type="button"
          className={styles.swapButton}
          onClick={handleSwapScales}
          disabled={isLoading}
          aria-label="Swap scales"
          title="Swap scales"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 16V4m0 0L3 8m4-4l4 4" />
            <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <ScaleDropdown
          label="To Scale"
          value={toScale}
          onChange={setToScale}
          disabled={isLoading}
        />
      </div>

      {/* Same-scale hint */}
      {isSameScale && (
        <p className={styles.sameScaleHint} role="status">
          <span aria-hidden="true">ℹ</span> Both scales are the same — the
          result will equal the input value.
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className={styles.convertButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className={styles.buttonContent}>
            <span className={styles.spinner} aria-hidden="true" />
            Converting…
          </span>
        ) : (
          <span className={styles.buttonContent}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.buttonIcon}
            >
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Convert
          </span>
        )}
      </button>
    </form>
  );
}