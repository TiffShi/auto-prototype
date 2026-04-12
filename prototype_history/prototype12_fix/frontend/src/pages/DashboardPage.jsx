import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient.js';
import Navbar from '../components/Navbar.jsx';
import WaterForm from '../components/WaterForm.jsx';
import WaterLog from '../components/WaterLog.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ReminderBanner from '../components/ReminderBanner.jsx';

const REMINDER_POLL_INTERVAL = 60_000; // 60 seconds

export default function DashboardPage() {
  const [entries, setEntries] = useState([]);
  const [totalMl, setTotalMl] = useState(0);
  const [dailyGoalMl, setDailyGoalMl] = useState(2000);
  const [goalPercentage, setGoalPercentage] = useState(0);
  const [reminder, setReminder] = useState(null);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [entriesError, setEntriesError] = useState('');

  const pollIntervalRef = useRef(null);

  // Fetch today's water entries
  const fetchEntries = useCallback(async () => {
    try {
      setEntriesError('');
      const response = await axiosClient.get('/water/entries');
      const { entries, total_ml, daily_goal_ml, goal_percentage } = response.data;
      setEntries(entries);
      setTotalMl(total_ml);
      setDailyGoalMl(daily_goal_ml);
      setGoalPercentage(goal_percentage);
    } catch (err) {
      setEntriesError('Failed to load water entries. Please try again.');
      console.error('Error fetching entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  // Check for reminders
  const checkReminder = useCallback(async () => {
    try {
      const response = await axiosClient.get('/reminders/check');
      const { has_reminder, message } = response.data;
      if (has_reminder && message) {
        setReminder(message);
      }
    } catch (err) {
      // Silently fail reminder checks — non-critical
      console.error('Error checking reminder:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEntries();
    checkReminder();
  }, [fetchEntries, checkReminder]);

  // Poll for reminders every 60 seconds
  useEffect(() => {
    pollIntervalRef.current = setInterval(checkReminder, REMINDER_POLL_INTERVAL);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [checkReminder]);

  const handleEntryAdded = useCallback((newEntry) => {
    // Optimistically update state, then re-fetch for accurate totals
    setEntries((prev) => [...prev, newEntry]);
    fetchEntries();
  }, [fetchEntries]);

  const handleEntryDeleted = useCallback((deletedId) => {
    setEntries((prev) => prev.filter((e) => e.id !== deletedId));
    fetchEntries();
  }, [fetchEntries]);

  const handleDismissReminder = useCallback(async () => {
    setReminder(null);
    try {
      await axiosClient.post('/reminders/acknowledge');
    } catch (err) {
      console.error('Error acknowledging reminder:', err);
    }
  }, []);

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {reminder && (
            <ReminderBanner
              message={reminder}
              onDismiss={handleDismissReminder}
            />
          )}

          <div className="dashboard-header">
            <h2 className="dashboard-title">Today's Hydration</h2>
            <p className="dashboard-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-left">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">💧 Daily Progress</h3>
                </div>
                <div className="card-body">
                  <ProgressBar
                    totalMl={totalMl}
                    dailyGoalMl={dailyGoalMl}
                    goalPercentage={goalPercentage}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">➕ Log Water</h3>
                </div>
                <div className="card-body">
                  <WaterForm onEntryAdded={handleEntryAdded} />
                </div>
              </div>
            </div>

            <div className="dashboard-right">
              <div className="card card-full-height">
                <div className="card-header">
                  <h3 className="card-title">📋 Today's Log</h3>
                  {entries.length > 0 && (
                    <span className="entry-count-badge">
                      {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                    </span>
                  )}
                </div>
                <div className="card-body">
                  {loadingEntries ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading entries...</p>
                    </div>
                  ) : entriesError ? (
                    <div className="alert alert-error">
                      <span className="alert-icon">⚠️</span>
                      {entriesError}
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={fetchEntries}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <WaterLog
                      entries={entries}
                      onEntryDeleted={handleEntryDeleted}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}