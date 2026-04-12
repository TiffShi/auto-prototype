import React, { useState } from 'react';
import ConverterForm from './components/ConverterForm.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';
import styles from './styles/App.module.css';

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResult = (data) => {
    setResult(data);
    setError(null);
  };

  const handleError = (message) => {
    setError(message);
    setResult(null);
  };

  const handleLoading = (loading) => {
    setIsLoading(loading);
  };

  return (
    <div className={styles.appWrapper}>
      <div className={styles.backgroundOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg
              className={styles.thermometerIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Temperature Converter</h1>
            <p className={styles.subtitle}>
              Convert between Celsius, Fahrenheit &amp; Kelvin instantly
            </p>
          </div>
        </header>

        <div className={styles.card}>
          <ConverterForm
            onResult={handleResult}
            onError={handleError}
            onLoading={handleLoading}
            isLoading={isLoading}
          />
          <ResultDisplay
            result={result}
            error={error}
            isLoading={isLoading}
          />
        </div>

        <footer className={styles.footer}>
          <p>All conversions route through Kelvin · Absolute zero enforced</p>
        </footer>
      </main>
    </div>
  );
}