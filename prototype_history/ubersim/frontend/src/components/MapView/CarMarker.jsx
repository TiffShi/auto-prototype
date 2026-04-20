import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const carIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #4f8ef7, #7c3aed);
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 0 4px rgba(79, 142, 247, 0.3), 0 4px 12px rgba(0,0,0,0.4);
      animation: car-pulse 1.5s ease-in-out infinite;
    ">🚗</div>
    <style>
      @keyframes car-pulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(79, 142, 247, 0.3), 0 4px 12px rgba(0,0,0,0.4); }
        50% { box-shadow: 0 0 0 8px rgba(79, 142, 247, 0.15), 0 4px 12px rgba(0,0,0,0.4); }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function CarMarker({ lat, lng }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: carIcon, zIndexOffset: 1000 });
      markerRef.current.addTo(map);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map]);

  // Smoothly animate position updates
  useEffect(() => {
    if (!markerRef.current) return;

    const currentLatLng = markerRef.current.getLatLng();
    const targetLatLng = L.latLng(lat, lng);

    // Skip animation if position hasn't changed meaningfully
    if (
      Math.abs(currentLatLng.lat - targetLatLng.lat) < 0.000001 &&
      Math.abs(currentLatLng.lng - targetLatLng.lng) < 0.000001
    ) {
      return;
    }

    // Smooth interpolation using requestAnimationFrame
    const DURATION = 450; // ms, slightly less than 500ms update interval
    const startLat = currentLatLng.lat;
    const startLng = currentLatLng.lng;
    const deltaLat = targetLatLng.lat - startLat;
    const deltaLng = targetLatLng.lng - startLng;
    const startTime = performance.now();

    let animFrameId;

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      const newLat = startLat + deltaLat * eased;
      const newLng = startLng + deltaLng * eased;

      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng]);
      }

      if (t < 1) {
        animFrameId = requestAnimationFrame(animate);
      }
    }

    animFrameId = requestAnimationFrame(animate);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [lat, lng]);

  return null;
}