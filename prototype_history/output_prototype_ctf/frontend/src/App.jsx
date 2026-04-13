import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SubmitForm from "./components/SubmitForm.jsx";
import Leaderboard from "./components/Leaderboard.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard`);
      setLeaderboard(response.data.leaderboard || []);
      setLastUpdated(new Date());
      setFetchError(null);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setFetchError("Unable to reach the server. Retrying...");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch + polling every 5 seconds
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const handleSubmitSuccess = useCallback(() => {
    // Immediately re-fetch after a successful submission
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-glow" />
        <h1 className="app-title">
          <span className="title-bracket">[</span>
          CTF LEADERBOARD
          <span className="title-bracket">]</span>
        </h1>
        <p className="app-subtitle">Capture The Flag — Live Rankings</p>
      </header>

      {/* Main content */}
      <main className="app-main">
        <div className="content-grid">
          {/* Submit Form Panel */}
          <section className="panel form-panel">
            <div className="panel-header">
              <span className="panel-icon">⚡</span>
              <h2 className="panel-title">Submit Score</h2>
            </div>
            <SubmitForm
              apiBaseUrl={API_BASE_URL}
              onSubmitSuccess={handleSubmitSuccess}
            />
          </section>

          {/* Leaderboard Panel */}
          <section className="panel leaderboard-panel">
            <div className="panel-header">
              <span className="panel-icon">🏆</span>
              <h2 className="panel-title">Rankings</h2>
              {lastUpdated && (
                <span className="last-updated">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            {fetchError && (
              <div className="error-banner">
                <span className="error-icon">⚠</span> {fetchError}
              </div>
            )}

            <Leaderboard leaderboard={leaderboard} isLoading={isLoading} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Polling every 5s &nbsp;|&nbsp; {leaderboard.length} team{leaderboard.length !== 1 ? "s" : ""} registered</p>
      </footer>
    </div>
  );
}

export default App;