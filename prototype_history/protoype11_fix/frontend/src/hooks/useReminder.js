import { useEffect, useRef } from 'react';
import useWaterStore from '../store/useWaterStore.js';

/**
 * useReminder
 *
 * Manages browser-based water reminder notifications.
 * - Requests Notification permission once on mount.
 * - When reminderEnabled is true, fires a notification every
 *   `settings.reminder_interval_min` minutes.
 * - Cleans up the interval when disabled or when the interval changes.
 */
export default function useReminder() {
  const { reminderEnabled, settings, setReminderIntervalId, reminderIntervalId } =
    useWaterStore();
  const intervalRef = useRef(null);

  // Request permission once on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Manage interval based on reminderEnabled + interval setting
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setReminderIntervalId(null);
    }

    if (!reminderEnabled) return;

    const intervalMs = (settings.reminder_interval_min || 60) * 60 * 1000;

    const fireNotification = () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('💧 Time to drink water!', {
            body: `Stay hydrated! Your goal is ${settings.daily_goal_ml}ml today.`,
            icon: '/vite.svg',
            tag: 'water-reminder',
          });
        } catch {
          // Notifications may fail silently in some environments
        }
      }
    };

    const id = setInterval(fireNotification, intervalMs);
    intervalRef.current = id;
    setReminderIntervalId(id);

    return () => {
      clearInterval(id);
      intervalRef.current = null;
    };
  }, [reminderEnabled, settings.reminder_interval_min, settings.daily_goal_ml, setReminderIntervalId]);

  return null;
}