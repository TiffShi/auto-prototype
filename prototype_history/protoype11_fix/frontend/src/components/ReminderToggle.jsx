import React, { useEffect } from 'react';
import useWaterStore from '../store/useWaterStore.js';

export default function ReminderToggle() {
  const { reminderEnabled, setReminderEnabled, settings } = useWaterStore();

  const notifSupported = 'Notification' in window;
  const permission = notifSupported ? Notification.permission : 'denied';

  const handleToggle = async () => {
    if (!notifSupported) return;

    if (!reminderEnabled) {
      // Request permission if needed
      if (permission === 'default') {
        const result = await Notification.requestPermission();
        if (result !== 'granted') return;
      }
      if (Notification.permission === 'granted') {
        setReminderEnabled(true);
      }
    } else {
      setReminderEnabled(false);
    }
  };

  const intervalLabel =
    settings.reminder_interval_min >= 60
      ? `${settings.reminder_interval_min / 60}h`
      : `${settings.reminder_interval_min}min`;

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-700 text-sm">Water Reminders</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {reminderEnabled
            ? `🔔 Active — every ${intervalLabel}`
            : permission === 'denied'
            ? '🚫 Notifications blocked by browser'
            : '🔕 Reminders are off'}
        </p>
      </div>

      <button
        onClick={handleToggle}
        disabled={!notifSupported || permission === 'denied'}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${reminderEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}
        role="switch"
        aria-checked={reminderEnabled}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm 
                      transition-transform duration-200
                      ${reminderEnabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}