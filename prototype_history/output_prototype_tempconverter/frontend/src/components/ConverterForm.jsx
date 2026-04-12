import React from "react";
import styles from "../styles/ConverterForm.module.css";

const SCALE_OPTIONS = [
  { value: "celsius", label: "Celsius (°C)" },
  { value: "fahrenheit", label: "Fahrenheit (°F)" },
  { value: "kelvin", label: "Kelvin (K)" },
];

const SCALE_SYMBOLS = {
  celsius: "°C",
  fahrenheit: "°F",
  kelvin: "K",
};

export default function ConverterForm({
  inputValue,
  fromScale,
  toScale,
  onInputChange,
  onFromScaleChange,
  onToScaleChange,
  onSubmit,
  isLoading,
}) {
  const handleInputChange = (e) => {
    onInputChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* Temperature Input */}
      <div className={styles.inputGroup}>
        <label htmlFor="temperature-input" className={styles.label}>
          Temperature Value
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="temperature-input"
            type="number"
            className={styles.input}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter temperature..."
            disabled={isLoading}
            step="any"
            aria-label="Temperature value"
          />
          <span className={styles.inputSuffix}>
            {SCALE_SYMBOLS[fromScale]}
          </span>
        </div>
      </div>

      {/* Scale Selectors */}
      <div className={styles.scalesRow}>
        <div className={styles.selectGroup}>
          <label htmlFor="from-scale" className={styles.label}>
            From
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="from-scale"
              className={styles.select}
              value={fromScale}
              onChange={(e) => onFromScaleChange(e.target.value)}
              disabled={isLoading}
              aria-label="From scale"
            >
              {SCALE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className={styles.selectArrow}>▾</span>
          </div>
        </div>

        <div className={styles.arrowDivider}>
          <span className={styles.arrowIcon}>→</span>
        </div>

        <div className={styles.selectGroup}>
          <label htmlFor="to-scale" className={styles.label}>
            To
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="to-scale"
              className={styles.select}
              value={toScale}
              onChange={(e) => onToScaleChange(e.target.value)}
              disabled={isLoading}
              aria-label="To scale"
            >
              {SCALE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className={styles.selectArrow}>▾</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className={styles.submitButton}
        onClick={onSubmit}
        disabled={isLoading}
        aria-label="Convert temperature"
      >
        {isLoading ? (
          <span className={styles.buttonContent}>
            <span className={styles.buttonSpinner}></span>
            Converting...
          </span>
        ) : (
          <span className={styles.buttonContent}>
            <span className={styles.buttonIcon}>⇄</span>
            Convert
          </span>
        )}
      </button>
    </div>
  );
}