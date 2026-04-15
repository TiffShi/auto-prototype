import React, { useState } from 'react';
import InputPanel from './components/InputPanel.jsx';
import StatsBar from './components/StatsBar.jsx';
import PrimeGrid from './components/PrimeGrid.jsx';
import { fetchPrimes } from './api/primeApi.js';
import './styles/App.css';

function App() {
  const [limit, setLimit] = useState('');
  const [primeSet, setPrimeSet] = useState(null);
  const [primeCount, setPrimeCount] = useState(0);
  const [resolvedLimit, setResolvedLimit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVisualize = async (inputLimit) => {
    setError('');
    setLoading(true);
    setPrimeSet(null);

    try {
      const data = await fetchPrimes(inputLimit);
      const newSet = new Set(data.primes);
      setPrimeSet(newSet);
      setPrimeCount(data.count);
      setResolvedLimit(data.limit);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setPrimeSet(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-icon">∑</div>
        <h1 className="app-title">Prime Number Visualizer</h1>
        <p className="app-subtitle">
          Explore prime numbers using the Sieve of Eratosthenes
        </p>
      </header>

      <main className="app-main">
        <InputPanel
          limit={limit}
          setLimit={setLimit}
          onVisualize={handleVisualize}
          loading={loading}
        />

        {error && (
          <div className="error-banner" role="alert">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">Computing primes…</p>
          </div>
        )}

        {!loading && primeSet !== null && (
          <>
            <StatsBar count={primeCount} limit={resolvedLimit} />
            <PrimeGrid limit={resolvedLimit} primeSet={primeSet} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Sieve of Eratosthenes · O(n log log n) · Up to 1,000,000</p>
      </footer>
    </div>
  );
}

export default App;