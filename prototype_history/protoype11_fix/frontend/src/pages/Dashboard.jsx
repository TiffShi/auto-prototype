import React, { useEffect } from 'react';
import useWaterStore from '../store/useWaterStore.js';
import ProgressBar from '../components/ProgressBar.jsx';
import LogWaterForm from '../components/LogWaterForm.jsx';
import EntryList from '../components/EntryList.jsx';
import ReminderToggle from '../components/ReminderToggle.jsx';

export default function Dashboard() {
  const { summary, fetchTodaySummary, loadingSummary, settings, error, clearError } =
    useWaterStore();

  // Refresh on mount and every 60 seconds
  useEffect(() => {
    fetchTodaySummary();
    const id = setInterval(fetchTodaySummary, 60_000);
    return () => clearInterval(id);
  }, [fetchTodaySummary]);

  const today = new Date().toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-5">
      {/* Date header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <button
          onClick={fetchTodaySummary}
          disabled={loadingSummary}
          className="btn-secondary text-sm flex items-center gap-1.5"
          title="Refresh"
        >
          <span className={loadingSummary ? 'animate-spin' : ''}>🔄</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 
                        flex items-center justify-between text-sm">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-600 ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Progress Card */}
      <div className="card">
        {loadingSummary && !summary.entries.length ? (
          <div className="flex items-center justify-center h-24 text-gray-400">
            <span className="animate-spin mr-2">⏳</span> Loading…
          </div>
        ) : (
          <ProgressBar
            totalMl={summary.total_ml}
            goalMl={summary.goal_ml}
            percentage={summary.percentage}
            unit={settings.preferred_unit}
          />
        )}
      </div>

      {/* Two-column layout on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Log Water */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>➕</span> Log Water
          </h2>
          <LogWaterForm />
        </div>

        {/* Today's Log */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <span>📋</span> Today's Log
            </h2>
            <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
              {summary.entries.length} {summary.entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <EntryList />
        </div>
      </div>

      {/* Reminder Toggle */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span>🔔</span> Reminders
        </h2>
        <ReminderToggle />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Entries Today',
            value: summary.entries.length,
            icon: '📝',
            color: 'text-blue-600',
          },
          {
            label: 'Total Intake',
            value:
              settings.preferred_unit === 'oz'
                ? `${(summary.total_ml / 29.5735).toFixed(1)} oz`
                : `${Math.round(summary.total_ml)} ml`,
            icon: '💧',
            color: 'text-cyan-600',
          },
          {
            label: 'Goal Progress',
            value: `${summary.percentage.toFixed(0)}%`,
            icon: '🎯',
            color:
              summary.percentage >= 100
                ? 'text-green-600'
                : summary.percentage >= 50
                ? 'text-blue-600'
                : 'text-orange-500',
          },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card text-center py-4">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}