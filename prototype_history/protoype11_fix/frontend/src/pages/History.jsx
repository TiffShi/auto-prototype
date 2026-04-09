import React, { useEffect } from 'react';
import useWaterStore from '../store/useWaterStore.js';
import HistoryChart from '../components/HistoryChart.jsx';

export default function History() {
  const { history, fetchHistory, loadingHistory, settings } = useWaterStore();
  const unit = settings.preferred_unit || 'ml';
  const OZ_TO_ML = 29.5735;

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const display = (ml) =>
    unit === 'oz' ? `${(ml / OZ_TO_ML).toFixed(1)} oz` : `${Math.round(ml)} ml`;

  const totalWeek = history.reduce((sum, d) => sum + d.total_ml, 0);
  const avgDay = history.length ? totalWeek / history.length : 0;
  const bestDay = history.reduce(
    (best, d) => (d.total_ml > best.total_ml ? d : best),
    { total_ml: 0, date: '' }
  );
  const daysGoalMet = history.filter((d) => d.percentage >= 100).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">History</h1>
          <p className="text-sm text-gray-400 mt-0.5">Last 7 days of water intake</p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loadingHistory}
          className="btn-secondary text-sm flex items-center gap-1.5"
        >
          <span className={loadingHistory ? 'animate-spin' : ''}>🔄</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Weekly stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Total', value: display(totalWeek), icon: '📊', color: 'text-blue-600' },
          { label: 'Daily Average', value: display(avgDay), icon: '📈', color: 'text-cyan-600' },
          {
            label: 'Best Day',
            value: bestDay.total_ml > 0 ? display(bestDay.total_ml) : '—',
            icon: '🏆',
            color: 'text-yellow-600',
          },
          {
            label: 'Goals Met',
            value: `${daysGoalMet} / 7`,
            icon: '🎯',
            color: daysGoalMet >= 5 ? 'text-green-600' : 'text-orange-500',
          },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card text-center py-4">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-lg font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span>📊</span> 7-Day Intake Chart
        </h2>
        <HistoryChart />
      </div>

      {/* Daily breakdown table */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span>📅</span> Daily Breakdown
        </h2>
        {loadingHistory ? (
          <div className="text-center py-8 text-gray-400">
            <span className="animate-spin inline-block mr-2">⏳</span> Loading…
          </div>
        ) : (
          <div className="space-y-2">
            {[...history].reverse().map((day) => {
              const pct = Math.min(day.percentage, 100);
              const barColor =
                pct >= 100
                  ? 'bg-green-500'
                  : pct >= 66
                  ? 'bg-blue-500'
                  : pct >= 33
                  ? 'bg-yellow-400'
                  : 'bg-red-400';

              const isToday =
                day.date === new Date().toISOString().split('T')[0];

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 flex items-center gap-1.5">
                      {isToday && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-semibold">
                          Today
                        </span>
                      )}
                      {new Date(day.date + 'T00:00:00').toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-gray-500">
                      {display(day.total_ml)}
                      <span className="text-gray-300 mx-1">/</span>
                      {display(day.goal_ml)}
                      <span
                        className={`ml-2 font-semibold ${
                          pct >= 100 ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}