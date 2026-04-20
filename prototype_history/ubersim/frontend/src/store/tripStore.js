import { create } from 'zustand';

const useTripStore = create((set, get) => ({
  // Active trip state
  activeTripId: null,
  activeTrip: null,
  currentStatus: null,
  carPosition: null, // { lat, lng }
  simulationComplete: false,

  // Trip list
  tripList: [],

  // Selected historical trip (for map display)
  selectedHistoryTrip: null,

  // Actions
  setActiveTripId: (tripId) =>
    set({ activeTripId: tripId, simulationComplete: false }),

  setActiveTrip: (trip) =>
    set({
      activeTrip: trip,
      currentStatus: trip?.status ?? null,
      carPosition: trip
        ? { lat: trip.pickup_lat, lng: trip.pickup_lng }
        : null,
    }),

  setCurrentStatus: (status) => set({ currentStatus: status }),

  setCarPosition: (lat, lng) => set({ carPosition: { lat, lng } }),

  setSimulationComplete: (val) => set({ simulationComplete: val }),

  setTripList: (trips) => set({ tripList: trips }),

  addTrip: (trip) =>
    set((state) => ({
      tripList: [trip, ...state.tripList.filter((t) => t.trip_id !== trip.trip_id)],
    })),

  updateTripInList: (tripId, updates) =>
    set((state) => ({
      tripList: state.tripList.map((t) =>
        t.trip_id === tripId ? { ...t, ...updates } : t
      ),
    })),

  setSelectedHistoryTrip: (trip) => set({ selectedHistoryTrip: trip }),

  clearActiveTrip: () =>
    set({
      activeTripId: null,
      activeTrip: null,
      currentStatus: null,
      carPosition: null,
      simulationComplete: false,
    }),
}));

export default useTripStore;