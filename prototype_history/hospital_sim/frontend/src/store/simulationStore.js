import { create } from 'zustand'

export const useSimulationStore = create((set, get) => ({
  speed: 1.0,
  isPaused: false,
  tickCount: 0,
  lastTickData: null,
  isConnected: false,

  setSpeed: (speed) => set({ speed }),
  setPaused: (isPaused) => set({ isPaused }),
  setConnected: (isConnected) => set({ isConnected }),

  onTick: (data) =>
    set((state) => ({
      tickCount: state.tickCount + 1,
      lastTickData: data,
    })),

  reset: () =>
    set({
      speed: 1.0,
      isPaused: false,
      tickCount: 0,
      lastTickData: null,
      isConnected: false,
    }),
}))