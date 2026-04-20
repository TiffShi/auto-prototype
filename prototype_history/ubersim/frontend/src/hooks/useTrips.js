import { useEffect, useCallback } from 'react';
import { listTrips, createTrip as apiCreateTrip } from '../api/tripsApi.js';
import useTripStore from '../store/tripStore.js';

export default function useTrips() {
  const setTripList = useTripStore((s) => s.setTripList);
  const addTrip = useTripStore((s) => s.addTrip);
  const setActiveTripId = useTripStore((s) => s.setActiveTripId);
  const setActiveTrip = useTripStore((s) => s.setActiveTrip);

  // Fetch all trips on mount
  useEffect(() => {
    async function fetchTrips() {
      try {
        const trips = await listTrips();
        setTripList(trips);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      }
    }
    fetchTrips();
  }, [setTripList]);

  // Create a new trip
  const createTrip = useCallback(
    async (payload) => {
      const trip = await apiCreateTrip(payload);
      addTrip(trip);
      setActiveTripId(trip.trip_id);
      setActiveTrip(trip);
      return trip;
    },
    [addTrip, setActiveTripId, setActiveTrip]
  );

  return { createTrip };
}