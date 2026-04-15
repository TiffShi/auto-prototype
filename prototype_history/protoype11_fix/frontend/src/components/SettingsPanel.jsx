import React, { useState, useEffect } from 'react';
import useWaterStore from '../store/useWaterStore.js';

export default function SettingsPanel() {
  const { settings, updateSettings, loadingSettings } = useWaterStore();

  const [form, setForm] = useState({
    daily_goal_ml: settings.daily_goal_ml,
    reminder_interval_min: settings.reminder_interval_min,
    preferred_unit: settings.preferred_unit,
  });
  const [feedback, setFeedback] = useState(null);
  const [dirty, setDirty] = useState(false);

  // Sync form when settings load from API
  useEffect(() => {
    setForm({
      daily_goal_ml: settings.daily_goal_ml,
      reminder_interval_min: settings.reminder_interval_min,
      preferred_unit: settings.preferred_unit,
    });
  }, [settings]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      daily_goal_ml: parseFloat(form.daily_goal_ml),
      reminder_interval_min: parseInt(form.reminder_interval_min, 10),
      preferred_unit: form.preferred_unit,
    };

    if (isNaN(payload.daily_goal_ml) || payload.daily_goal_ml <= 0) {
      setFeedback({ type: 'error', msg: 'Daily goal must be a positive number.' });
      return;
    }
    if (isNaN(payload.reminder_interval_min) || payload.reminder_interval_min < 1) {
      setFeedback({ type: 'error', msg: 'Reminder interval must be at least 1 minute.' });
      return;
    }

    const result = await updateSettings(payload);
    if (result.success) {
      setFeedback({ type: 'success', msg: '✅ Settings saved!' });
      setDirty(false);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', msg: result.error || 'Failed to save settings.' });
    }
  };

  const GOAL_PRESETS_ML = [1500, 2000, 2500, 3000];
  const INTERVAL_PRESETS = [30, 60, 90, 120];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Daily Goal */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Daily Water Goal
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="100"
            step="50"
            value={form.daily_goal_ml}
            onChange={(e) => handleChange('daily_goal_ml', e.target.value)}
            className="input-field flex-1"
          />
          <span className="flex items-center text-sm text-gray-500 font-medium px-3 
                           bg-gray-50 border border-gray-200 rounded-xl">
            ml
          </span>
        </div>
        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          {GOAL_PRESETS_ML.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleChange('daily_goal_ml', v)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors
                ${parseFloat(form.daily_goal_ml) === v
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {v} ml
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Unit */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Preferred Unit
        </label>
        <div className="flex gap-3">
          {['ml', 'oz'].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => handleChange('preferred_unit', u)}
              className={`flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-colors
                ${form.preferred_unit === u
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
            >
              {u === 'ml' ? '🧪 Millilitres (ml)' : '🥤 Fluid Ounces (oz)'}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder Interval */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Reminder Interval
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="480"
            step="1"
            value={form.reminder_interval_min}
            onChange={(e) => handleChange('reminder_interval_min', e.target.value)}
            className="input-field flex-1"
          />
          <span className="flex items-center text-sm text-gray-500 font-medium px-3 
                           bg-gray-50 border border-gray-200 rounded-xl whitespace-nowrap">
            minutes
          </span>
        </div>
        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          {INTERVAL_PRESETS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleChange('reminder_interval_min', v)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors
                ${parseInt(form.reminder_interval_min, 10) === v
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {v >= 60 ? `${v / 60}h` : `${v}min`}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`text-sm px-4 py-2.5 rounded-xl font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loadingSettings || !dirty}
        className="btn-primary w-full"
      >
        {loadingSettings ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Saving…
          </span>
        ) : (
          '💾 Save Settings'
        )}
      </button>
    </form>
  );
}