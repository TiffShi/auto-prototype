import React from 'react';

function getProgressColor(percentage) {
  if (percentage >= 100) return '#22c55e'; // green
  if (percentage >= 75) return '#3b82f6';  // blue
  if (percentage >= 50) return '#60a5fa';  // light blue
  if (percentage >= 25) return '#93c5fd';  // lighter blue
  return '#bfdbfe';                         // very light blue
}

function getProgressEmoji(percentage) {
  if (percentage >= 100) return '🎉';
  if (percentage >= 75) return '💪';
  if (percentage >= 50) return '👍';
  if (percentage >= 25) return '💧';
  return '🥤';
}

function getProgressMessage(percentage) {
  if (percentage >= 100) return "Goal reached! Amazing work!";
  if (percentage >= 75) return "Almost there! Keep it up!";
  if (percentage >= 50) return "Halfway there! Great progress!";
  if (percentage >= 25) return "Good start! Keep drinking!";
  return "Start hydrating to reach your goal!";
}

export default function ProgressBar({ totalMl, dailyGoalMl, goalPercentage }) {
  const clampedPercentage = Math.min(goalPercentage, 100);
  const progressColor = getProgressColor(clampedPercentage);
  const emoji = getProgressEmoji(clampedPercentage);
  const message = getProgressMessage(clampedPercentage);

  const remainingMl = Math.max(dailyGoalMl - totalMl, 0);

  return (
    <div className="progress-container">
      <div className="progress-stats">
        <div className="progress-stat">
          <span className="progress-stat-value">
            {totalMl >= 1000
              ? `${(totalMl / 1000).toFixed(1)}L`
              : `${totalMl}ml`}
          </span>
          <span className="progress-stat-label">Consumed</span>
        </div>

        <div className="progress-percentage-display">
          <span className="progress-emoji">{emoji}</span>
          <span className="progress-percentage-value">
            {Math.round(clampedPercentage)}%
          </span>
        </div>

        <div className="progress-stat progress-stat-right">
          <span className="progress-stat-value">
            {dailyGoalMl >= 1000
              ? `${(dailyGoalMl / 1000).toFixed(1)}L`
              : `${dailyGoalMl}ml`}
          </span>
          <span className="progress-stat-label">Goal</span>
        </div>
      </div>

      <div className="progress-bar-track" role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(clampedPercentage)}% of daily water goal`}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: progressColor,
            transition: 'width 0.6s ease, background-color 0.6s ease',
          }}
        >
          {clampedPercentage > 10 && (
            <span className="progress-bar-label">
              {Math.round(clampedPercentage)}%
            </span>
          )}
        </div>
      </div>

      <p className="progress-message">{message}</p>

      {remainingMl > 0 && (
        <p className="progress-remaining">
          <strong>
            {remainingMl >= 1000
              ? `${(remainingMl / 1000).toFixed(1)}L`
              : `${remainingMl}ml`}
          </strong>{' '}
          remaining to reach your daily goal
        </p>
      )}

      {goalPercentage >= 100 && (
        <div className="goal-achieved-badge">
          🏆 Daily Goal Achieved!
        </div>
      )}
    </div>
  );
}