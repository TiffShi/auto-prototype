import React from 'react';

/**
 * ProgressBar
 * Props:
 *   totalMl   {number}
 *   goalMl    {number}
 *   percentage {number}  0–100
 *   unit      {string}  "ml" | "oz"
 */
export default function ProgressBar({ totalMl, goalMl, percentage, unit }) {
  const OZ_TO_ML = 29.5735;

  const display = (ml) =>
    unit === 'oz' ? `${(ml / OZ_TO_ML).toFixed(1)} oz` : `${Math.round(ml)} ml`;

  const clampedPct = Math.min(percentage, 100);

  const barColor =
    clampedPct >= 100
      ? 'bg-green-500'
      : clampedPct >= 66
      ? 'bg-blue-500'
      : clampedPct >= 33
      ? 'bg-yellow-400'
      : 'bg-red-400';

  const textColor =
    clampedPct >= 100
      ? 'text-green-600'
      : clampedPct >= 66
      ? 'text-blue-600'
      : clampedPct >= 33
      ? 'text-yellow-600'
      : 'text-red-500';

  const emoji =
    clampedPct >= 100 ? '🎉' : clampedPct >= 66 ? '💧' : clampedPct >= 33 ? '🌊' : '😟';

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Today's Progress</p>
          <p className={`text-2xl font-bold ${textColor}`}>
            {display(totalMl)}
            <span className="text-base font-normal text-gray-400 ml-1">
              / {display(goalMl)}
            </span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl">{emoji}</span>
          <p className={`text-lg font-bold ${textColor}`}>{clampedPct.toFixed(0)}%</p>
        </div>
      </div>

      {/* Progress track */}
      <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${clampedPct}%` }}
        />
        {/* Milestone markers */}
        {[33, 66].map((mark) => (
          <div
            key={mark}
            className="absolute top-0 bottom-0 w-px bg-white/60"
            style={{ left: `${mark}%` }}
          />
        ))}
      </div>

      {/* Status message */}
      <p className="text-sm text-gray-500 text-center">
        {clampedPct >= 100
          ? '🎉 Daily goal reached! Great job staying hydrated!'
          : `${display(Math.max(goalMl - totalMl, 0))} remaining to reach your goal`}
      </p>
    </div>
  );
}