import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CarMarker from './CarMarker.jsx';
import useTripStore from '../../store/tripStore.js';
import './MapView.css';

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pickup marker (green)
const pickupIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #22c55e;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom dropoff marker (red)
const dropoffIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #ef4444;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to auto-fit map bounds when trip changes
function MapBoundsFitter({ positions }) {
  const map = useMap();
  const prevPositionsRef = useRef(null);

  useEffect(() => {
    if (!positions || positions.length < 2) return;

    const posStr = JSON.stringify(positions);
    if (posStr === prevPositionsRef.current) return;
    prevPositionsRef.current = posStr;

    try {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } catch (e) {
      console.warn('Failed to fit bounds:', e);
    }
  }, [positions, map]);

  return null;
}

const DEFAULT_CENTER = [51.505, -0.09];
const DEFAULT_ZOOM = 13;

export default function MapView() {
  const activeTrip = useTripStore((s) => s.activeTrip);
  const carPosition = useTripStore((s) => s.carPosition);
  const selectedHistoryTrip = useTripStore((s) => s.selectedHistoryTrip);

  // Determine which trip to display on map
  const displayTrip = activeTrip || selectedHistoryTrip;

  const pickupPos = displayTrip
    ? [displayTrip.pickup_lat, displayTrip.pickup_lng]
    : null;

  const dropoffPos = displayTrip
    ? [displayTrip.dropoff_lat, displayTrip.dropoff_lng]
    : null;

  const routePositions =
    pickupPos && dropoffPos ? [pickupPos, dropoffPos] : null;

  // Positions for bounds fitting
  const boundsPositions = routePositions
    ? carPosition
      ? [...routePositions, [carPosition.lat, carPosition.lng]]
      : routePositions
    : null;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="leaflet-map"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-fit bounds */}
        {boundsPositions && (
          <MapBoundsFitter positions={boundsPositions} />
        )}

        {/* Route polyline */}
        {routePositions && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#4f8ef7',
              weight: 3,
              opacity: 0.7,
              dashArray: '8, 6',
            }}
          />
        )}

        {/* Pickup marker */}
        {pickupPos && (
          <Marker position={pickupPos} icon={pickupIcon} />
        )}

        {/* Dropoff marker */}
        {dropoffPos && (
          <Marker position={dropoffPos} icon={dropoffIcon} />
        )}

        {/* Animated car marker */}
        {carPosition && activeTrip && (
          <CarMarker lat={carPosition.lat} lng={carPosition.lng} />
        )}
      </MapContainer>

      {/* Map legend */}
      {displayTrip && (
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-dot pickup"></span>
            <span>Pickup</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dropoff"></span>
            <span>Drop-off</span>
          </div>
          {carPosition && activeTrip && (
            <div className="legend-item">
              <span className="legend-car">🚗</span>
              <span>Driver</span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!displayTrip && (
        <div className="map-empty-state">
          <div className="empty-icon">🗺️</div>
          <p>Create a trip to see it on the map</p>
        </div>
      )}
    </div>
  );
}