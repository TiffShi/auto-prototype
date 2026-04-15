import React from 'react';
import SettingsPanel from '../components/SettingsPanel.jsx';
import ReminderToggle from '../components/ReminderToggle.jsx';
import useWaterStore from '../store/useWaterStore.js';

export default function Settings() {
  const { settings, loadingSettings } = useWaterStore();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Customize your hydration goals and preferences
        </p>
      </div>

      {/* Current settings summary */}
      <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <h2 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
          <span>ℹ️</span> Current Configuration
        </h2>
        {loadingSettings ? (
          <div className="text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-blue-700">{settings.daily_goal_ml}</p>
              <p className="text-xs text-gray-500">Daily Goal (ml)</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-700">
                {settings.reminder_interval_min}
              </p>
              <p className="text-xs text-gray-500">Reminder (min)</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-700 uppercase">
                {settings.preferred_unit}
              </p>
              <p className="text-xs text-gray-500">Preferred Unit</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings form */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-700 mb-5 flex items-center gap-2">
          <span>⚙️</span> Preferences
        </h2>
        <SettingsPanel />
      </div>

      {/* Reminder toggle */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span>🔔</span> Browser Reminders
        </h2>
        <ReminderToggle />
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <strong>Note:</strong> Browser notifications require permission. Reminders fire
          every <strong>{settings.reminder_interval_min} minutes</strong> while this tab
          is open. Change the interval above and save to update.
        </div>
      </div>

      {/* About */}
      <div className="card text-center text-sm text-gray-400 space-y-1">
        <p className="text-2xl">💧</p>
        <p className="font-semibold text-gray-600">HydroTrack v1.0</p>
        <p>Stay hydrated, stay healthy!</p>
        <p className="text-xs">
          Daily goal resets automatically at midnight (UTC).
        </p>
      </div>
    </div>
  );
}