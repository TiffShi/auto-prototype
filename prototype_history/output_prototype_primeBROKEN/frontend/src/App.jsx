import React, { useState } from 'react';
import InputPanel from './components/InputPanel.jsx';
import PrimeGrid from './components/PrimeGrid.jsx';
import { fetchPrimes } from './api/primeApi.js';
import './styles/App.css';

function App() {
  const [limit, setLimit] = useState(null);
  const [primes, setPrimes] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasResult, setHasResult] = useState(false);

  const handleVisualize = async (inputLimit) => {
    setError('');
    setLoading(true);
    setHasResult(false);
    setPrimes(new Set());
    setLimit(null);

    try {
      const data = await fetchPrimes(inputLimit);
      setPrimes(new Set(data.primes));
      setLimit(data.limit);
      setHasResult(true);
    } catch (err) {
      setError(err.message);
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
          Discover prime numbers using the{' '}
          <span className="highlight-text">Sieve of Eratosthenes</span>
        </p>
      </header>

      <main className="app-main">
        <InputPanel onVisualize={handleVisualize} loading={loading} />

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

        {hasResult && !loading && (
          <div className="result-summary">
            <div className="summary-card">
              <span className="summary-number">{primes.size}</span>
              <span className="summary-label">Primes Found</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">{limit}</span>
              <span className="summary-label">Upper Limit</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">
                {limit > 0 ? ((primes.size / limit) * 100).toFixed(1) : 0}%
              </span>
              <span className="summary-label">Prime Density</span>
            </div>
          </div>
        )}

        {hasResult && !loading && limit && (
          <PrimeGrid limit={limit} primes={primes} />
        )}
      </main>

      <footer className="app-footer">
        <p>Prime Visualizer &mdash; Sieve of Eratosthenes</p>
      </footer>
    </div>
  );
}

export default App;