import React, { useState } from 'react';
import useWaterStore from '../store/useWaterStore.js';

const QUICK_AMOUNTS_ML = [150, 250, 350, 500];
const QUICK_AMOUNTS_OZ = [5, 8, 12, 16];

export default function LogWaterForm() {
  const { logEntry, loadingLog, settings } = useWaterStore();
  const preferredUnit = settings.preferred_unit || 'ml';

  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState(preferredUnit);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  const quickAmounts = unit === 'oz' ? QUICK_AMOUNTS_OZ : QUICK_AMOUNTS_ML;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setFeedback({ type: 'error', msg: 'Please enter a valid amount greater than 0.' });
      return;
    }

    const result = await logEntry({ amount: parsed, unit });
    if (result.success) {
      setFeedback({ type: 'success', msg: `✅ Logged ${parsed} ${unit}!` });
      setAmount('');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', msg: result.error || 'Failed to log entry.' });
    }
  };

  const handleQuickAdd = async (val) => {
    const result = await logEntry({ amount: val, unit });
    if (result.success) {
      setFeedback({ type: 'success', msg: `✅ Logged ${val} ${unit}!` });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', msg: result.error || 'Failed to log entry.' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick-add buttons */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Quick Add
        </p>
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((val) => (
            <button
              key={val}
              onClick={() => handleQuickAdd(val)}
              disabled={loadingLog}
              className="btn-secondary text-sm py-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
            >
              {val} {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or enter custom</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Custom amount form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            step="any"
            placeholder={`Amount (${unit})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field flex-1"
            disabled={loadingLog}
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="input-field w-24"
            disabled={loadingLog}
          >
            <option value="ml">ml</option>
            <option value="oz">oz</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loadingLog || !amount}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loadingLog ? (
            <>
              <span className="animate-spin">⏳</span> Logging…
            </>
          ) : (
            <>
              <span>💧</span> Log Water
            </>
          )}
        </button>
      </form>

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
    </div>
  );
}