import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import useWaterStore from '../store/useWaterStore.js';

function formatDate(isoDate) {
  try {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return isoDate;
  }
}

function getBarColor(percentage) {
  if (percentage >= 100) return '#22c55e'; // green
  if (percentage >= 66)  return '#3b82f6'; // blue
  if (percentage >= 33)  return '#facc15'; // yellow
  return '#f87171';                         // red
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const OZ_TO_ML = 29.5735;
  const display = (ml) =>
    unit === 'oz' ? `${(ml / OZ_TO_ML).toFixed(1)} oz` : `${Math.round(ml)} ml`;

  return (
    <div className="bg-white border border-blue-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{formatDate(d.date)}</p>
      <p className="text-blue-600">Intake: <strong>{display(d.total_ml)}</strong></p>
      <p className="text-gray-500">Goal: {display(d.goal_ml)}</p>
      <p className={`font-bold ${d.percentage >= 100 ? 'text-green-600' : 'text-orange-500'}`}>
        {d.percentage.toFixed(0)}% of goal
      </p>
    </div>
  );
};

export default function HistoryChart() {
  const { history, loadingHistory, settings } = useWaterStore();
  const unit = settings.preferred_unit || 'ml';
  const OZ_TO_ML = 29.5735;

  const displayVal = (ml) =>
    unit === 'oz' ? parseFloat((ml / OZ_TO_ML).toFixed(1)) : Math.round(ml);

  const chartData = history.map((d) => ({
    ...d,
    displayTotal: displayVal(d.total_ml),
    displayGoal: displayVal(d.goal_ml),
    shortDate: new Date(d.date + 'T00:00:00').toLocaleDateString([], {
      weekday: 'short',
    }),
  }));

  const goalLine = chartData[0] ? displayVal(chartData[0].goal_ml) : 0;

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <span className="animate-spin mr-2">⏳</span> Loading history…
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="text-4xl mb-2">📊</div>
        <p>No history data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        {[
          { color: '#22c55e', label: '≥ 100% goal' },
          { color: '#3b82f6', label: '66–99%' },
          { color: '#facc15', label: '33–65%' },
          { color: '#f87171', label: '< 33%' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-px border-t-2 border-dashed border-orange-400" />
          <span>Daily goal</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" vertical={false} />
          <XAxis
            dataKey="shortDate"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}${unit}`}
            width={55}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: '#eff6ff' }} />
          <ReferenceLine
            y={goalLine}
            stroke="#fb923c"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
          <Bar dataKey="displayTotal" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {chartData.map((entry) => (
              <Cell key={entry.date} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}