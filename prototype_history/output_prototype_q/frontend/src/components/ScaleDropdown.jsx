import React from 'react';
import styles from '../styles/ConverterForm.module.css';

const SCALES = ['Celsius', 'Fahrenheit', 'Kelvin'];

const SCALE_SYMBOLS = {
  Celsius: '°C',
  Fahrenheit: '°F',
  Kelvin: 'K',
};

export default function ScaleDropdown({ label, value, onChange, disabled }) {
  return (
    <div className={styles.dropdownGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={label}
        >
          {SCALES.map((scale) => (
            <option key={scale} value={scale}>
              {scale} ({SCALE_SYMBOLS[scale]})
            </option>
          ))}
        </select>
        <span className={styles.selectArrow}>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}