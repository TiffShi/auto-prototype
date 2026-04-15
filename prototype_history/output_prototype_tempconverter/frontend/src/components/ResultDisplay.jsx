import React from "react";
import styles from "../styles/ResultDisplay.module.css";

const SCALE_SYMBOLS = {
  celsius: "°C",
  fahrenheit: "°F",
  kelvin: "K",
};

const SCALE_LABELS = {
  celsius: "Celsius",
  fahrenheit: "Fahrenheit",
  kelvin: "Kelvin",
};

export default function ResultDisplay({ result, error }) {
  if (error) {
    return (
      <div className={`${styles.container} ${styles.errorContainer}`} role="alert">
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorContent}>
          <p className={styles.errorTitle}>Conversion Error</p>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const fromSymbol = SCALE_SYMBOLS[result.from_scale] || "";
  const toSymbol = SCALE_SYMBOLS[result.to_scale] || "";
  const fromLabel = SCALE_LABELS[result.from_scale] || result.from_scale;
  const toLabel = SCALE_LABELS[result.to_scale] || result.to_scale;

  const formattedInput = Number.isInteger(result.input_value)
    ? result.input_value.toString()
    : parseFloat(result.input_value.toFixed(4)).toString();

  const formattedResult = parseFloat(result.result.toFixed(4)).toString();

  return (
    <div className={`${styles.container} ${styles.successContainer}`} role="region" aria-label="Conversion result">
      <div className={styles.successIcon}>✓</div>

      <div className={styles.resultContent}>
        <p className={styles.resultLabel}>Conversion Result</p>

        <div className={styles.conversionFlow}>
          <div className={styles.valueBlock}>
            <span className={styles.valueNumber}>
              {formattedInput}
            </span>
            <span className={styles.valueUnit}>{fromSymbol}</span>
            <span className={styles.scaleLabel}>{fromLabel}</span>
          </div>

          <div className={styles.flowArrow}>→</div>

          <div className={`${styles.valueBlock} ${styles.resultBlock}`}>
            <span className={styles.resultNumber}>
              {formattedResult}
            </span>
            <span className={styles.resultUnit}>{toSymbol}</span>
            <span className={styles.scaleLabel}>{toLabel}</span>
          </div>
        </div>

        <p className={styles.fullResult}>
          <strong>{formattedResult} {toSymbol}</strong>
        </p>
      </div>
    </div>
  );
}