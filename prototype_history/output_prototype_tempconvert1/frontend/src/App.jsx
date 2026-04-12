import React, { useState } from "react";
import ConverterForm from "./components/ConverterForm.jsx";
import ResultDisplay from "./components/ResultDisplay.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { convertTemperature } from "./api/converterApi.js";
import styles from "./styles/App.module.css";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [fromScale, setFromScale] = useState("celsius");
  const [toScale, setToScale] = useState("fahrenheit");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    // Frontend validation
    if (inputValue === "" || inputValue === null || inputValue === undefined) {
      setError("Please enter a temperature value.");
      setResult(null);
      return;
    }

    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) {
      setError("Please enter a valid numeric value.");
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await convertTemperature(numericValue, fromScale, toScale);
      setResult(data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(`Network error: ${err.message}`);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>🌡️</span>
          </div>
          <h1 className={styles.title}>Temperature Converter</h1>
          <p className={styles.subtitle}>
            Convert between Celsius, Fahrenheit, and Kelvin instantly
          </p>
        </header>

        <main className={styles.main}>
          <ConverterForm
            inputValue={inputValue}
            fromScale={fromScale}
            toScale={toScale}
            onInputChange={setInputValue}
            onFromScaleChange={setFromScale}
            onToScaleChange={setToScale}
            onSubmit={handleConvert}
            isLoading={isLoading}
          />

          {isLoading && <LoadingSpinner />}

          {!isLoading && (result || error) && (
            <ResultDisplay result={result} error={error} />
          )}
        </main>

        <footer className={styles.footer}>
          <p>Powered by FastAPI &amp; React</p>
        </footer>
      </div>
    </div>
  );
}