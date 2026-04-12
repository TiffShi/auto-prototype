import React, { useEffect, useState } from 'react';

export default function ReminderBanner({ message, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for fade-out animation
  };

  return (
    <div
      className={`reminder-banner ${isVisible ? 'reminder-banner-visible' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="reminder-banner-content">
        <span className="reminder-icon">🔔</span>
        <div className="reminder-text">
          <strong className="reminder-title">Hydration Reminder</strong>
          <p className="reminder-message">{message}</p>
        </div>
      </div>
      <button
        className="reminder-dismiss-btn"
        onClick={handleDismiss}
        aria-label="Dismiss reminder"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}