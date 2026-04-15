import React, { useState } from 'react';
import useWaterStore from '../store/useWaterStore.js';

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function EntryList() {
  const { summary, deleteEntry, settings } = useWaterStore();
  const entries = summary?.entries || [];
  const unit = settings.preferred_unit || 'ml';
  const OZ_TO_ML = 29.5735;

  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const displayAmount = (amount, entryUnit) => {
    if (unit === 'oz') {
      const ml = entryUnit === 'oz' ? amount * OZ_TO_ML : amount;
      return `${(ml / OZ_TO_ML).toFixed(1)} oz`;
    }
    const ml = entryUnit === 'oz' ? amount * OZ_TO_ML : amount;
    return `${Math.round(ml)} ml`;
  };

  const handleDelete = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    setConfirmId(null);
    await deleteEntry(id);
    setDeletingId(null);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="text-4xl mb-2">🫗</div>
        <p className="font-medium">No entries yet today</p>
        <p className="text-sm mt-1">Log your first drink above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {[...entries].reverse().map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between bg-blue-50/60 hover:bg-blue-50 
                     border border-blue-100 rounded-xl px-4 py-3 group transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💧</span>
            <div>
              <p className="font-semibold text-blue-800 text-sm">
                {displayAmount(entry.amount, entry.unit)}
              </p>
              <p className="text-xs text-gray-400">{formatTime(entry.logged_at)}</p>
            </div>
          </div>

          <button
            onClick={() => handleDelete(entry.id)}
            disabled={deletingId === entry.id}
            className={`btn-danger text-xs transition-all ${
              confirmId === entry.id
                ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                : ''
            }`}
            title={confirmId === entry.id ? 'Click again to confirm' : 'Delete entry'}
          >
            {deletingId === entry.id
              ? '⏳'
              : confirmId === entry.id
              ? 'Confirm?'
              : '🗑️'}
          </button>
        </div>
      ))}
    </div>
  );
}