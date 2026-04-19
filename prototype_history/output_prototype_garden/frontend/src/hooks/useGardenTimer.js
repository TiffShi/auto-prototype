import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Growth curve: returns how many flowers should exist at `elapsed` seconds.
 * 0–10s: 1 flower
 * 10–30s: 2–4 flowers
 * 30–60s: 5–8 flowers
 * 60s+: continues growing organically
 */
function computeBloomCount(elapsed) {
  if (elapsed <= 0) return 0;
  if (elapsed < 2) return 1;
  return Math.min(60, Math.floor(Math.log(elapsed + 1) * 4.5));
}

export default function useGardenTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [bloomCount, setBloomCount] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimeRef.current = Date.now();
    setElapsed(0);
    setBloomCount(0);
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const secs = Math.floor((now - startTimeRef.current) / 1000);
      setElapsed(secs);
      setBloomCount(computeBloomCount(secs));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { elapsed, bloomCount, reset };
}