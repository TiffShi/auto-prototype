import { create } from 'zustand'

let notifId = 0

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  events: [],

  addNotification: (message, type = 'info') => {
    const id = ++notifId
    const notification = {
      id,
      message,
      type,
      timestamp: new Date(),
    }
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 5),
    }))
    // Auto-remove after 5s
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, 5000)
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  setEvents: (events) => set({ events }),

  prependEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 100),
    })),

  clearNotifications: () => set({ notifications: [] }),
}))