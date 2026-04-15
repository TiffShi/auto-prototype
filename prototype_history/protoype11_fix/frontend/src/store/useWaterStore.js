import { create } from 'zustand';
import {
  getTodaySummary,
  getHistorySummary,
  getSettings,
  updateSettings as apiUpdateSettings,
  logEntry as apiLogEntry,
  deleteEntry as apiDeleteEntry,
} from '../api/waterApi.js';

const useWaterStore = create((set, get) => ({
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  summary: {
    total_ml: 0,
    goal_ml: 2000,
    percentage: 0,
    entries: [],
  },
  history: [],
  settings: {
    id: 1,
    daily_goal_ml: 2000,
    reminder_interval_min: 60,
    preferred_unit: 'ml',
  },
  reminderEnabled: false,
  reminderIntervalId: null,

  // Loading / error states
  loadingSummary: false,
  loadingHistory: false,
  loadingSettings: false,
  loadingLog: false,
  error: null,

  // -------------------------------------------------------------------------
  // Actions — Summary
  // -------------------------------------------------------------------------
  fetchTodaySummary: async () => {
    set({ loadingSummary: true, error: null });
    try {
      const data = await getTodaySummary();
      set({ summary: data, loadingSummary: false });
    } catch (err) {
      set({ error: err.message, loadingSummary: false });
    }
  },

  fetchHistory: async () => {
    set({ loadingHistory: true, error: null });
    try {
      const data = await getHistorySummary();
      set({ history: data.history, loadingHistory: false });
    } catch (err) {
      set({ error: err.message, loadingHistory: false });
    }
  },

  // -------------------------------------------------------------------------
  // Actions — Entries
  // -------------------------------------------------------------------------
  logEntry: async (payload) => {
    set({ loadingLog: true, error: null });
    try {
      await apiLogEntry(payload);
      // Refresh summary after logging
      const data = await getTodaySummary();
      set({ summary: data, loadingLog: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loadingLog: false });
      return { success: false, error: err.message };
    }
  },

  deleteEntry: async (id) => {
    set({ error: null });
    try {
      await apiDeleteEntry(id);
      // Refresh summary after deletion
      const data = await getTodaySummary();
      set({ summary: data });
      return { success: true };
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  // -------------------------------------------------------------------------
  // Actions — Settings
  // -------------------------------------------------------------------------
  fetchSettings: async () => {
    set({ loadingSettings: true, error: null });
    try {
      const data = await getSettings();
      set({ settings: data, loadingSettings: false });
    } catch (err) {
      set({ error: err.message, loadingSettings: false });
    }
  },

  updateSettings: async (payload) => {
    set({ loadingSettings: true, error: null });
    try {
      const data = await apiUpdateSettings(payload);
      set({ settings: data, loadingSettings: false });
      // Refresh summary in case goal changed
      const summary = await getTodaySummary();
      set({ summary });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loadingSettings: false });
      return { success: false, error: err.message };
    }
  },

  // -------------------------------------------------------------------------
  // Actions — Reminder
  // -------------------------------------------------------------------------
  setReminderEnabled: (enabled) => set({ reminderEnabled: enabled }),
  setReminderIntervalId: (id) => set({ reminderIntervalId: id }),

  clearError: () => set({ error: null }),
}));

export default useWaterStore;