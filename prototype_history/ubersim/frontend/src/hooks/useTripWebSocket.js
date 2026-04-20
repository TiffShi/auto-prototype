import { useEffect, useRef } from 'react';
import useTripStore from '../store/tripStore.js';

const WS_BASE_URL = import.meta.env.VITE_WS_URL;

export default function useTripWebSocket() {
  const activeTripId = useTripStore((s) => s.activeTripId);
  const setCurrentStatus = useTripStore((s) => s.setCurrentStatus);
  const setCarPosition = useTripStore((s) => s.setCarPosition);
  const setSimulationComplete = useTripStore((s) => s.setSimulationComplete);
  const updateTripInList = useTripStore((s) => s.updateTripInList);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (!activeTripId) return;

    let retryCount = 0;
    const MAX_RETRIES = 5;

    function connect() {
      if (!isMountedRef.current) return;

      const wsUrl = `${WS_BASE_URL}/ws/trips/${activeTripId}`;
      console.log(`[WS] Connecting to ${wsUrl}`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[WS] Connected for trip ${activeTripId}`);
        retryCount = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
      };

      ws.onclose = (event) => {
        console.log(`[WS] Closed for trip ${activeTripId}. Code: ${event.code}`);
        wsRef.current = null;

        // Don't reconnect if simulation is complete or component unmounted
        if (!isMountedRef.current) return;
        if (event.code === 1000 || event.code === 4004) return;

        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = Math.min(1000 * retryCount, 5000);
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${retryCount})`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    }

    function handleMessage(data) {
      if (!isMountedRef.current) return;

      switch (data.event) {
        case 'STATUS_UPDATE':
          setCurrentStatus(data.status);
          updateTripInList(data.trip_id, { status: data.status });
          break;

        case 'POSITION_UPDATE':
          setCarPosition(data.lat, data.lng);
          break;

        case 'SIMULATION_COMPLETE':
          setSimulationComplete(true);
          // Close the WebSocket gracefully
          if (wsRef.current) {
            wsRef.current.onclose = null;
            wsRef.current.close(1000, 'Simulation complete');
            wsRef.current = null;
          }
          break;

        default:
          console.warn('[WS] Unknown event type:', data.event);
      }
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close(1000, 'Component cleanup');
        wsRef.current = null;
      }
    };
  }, [activeTripId, setCurrentStatus, setCarPosition, setSimulationComplete, updateTripInList]);
}