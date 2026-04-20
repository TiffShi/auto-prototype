import React, { useEffect, useState } from 'react';
import { listTrips } from '../../api/tripsApi.js';
import useTripStore from '../../store/tripStore.js';
import './TripHistory.css';

const STATUS_CONFIG = {
  SEARCHING_FOR_DRIVER: { label: 'Searching', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  DRIVER_EN_ROUTE: { label: 'En Route', color: '#4f8ef7', bg: 'rgba(79, 142, 247, 0.1)' },
  TRIP_IN_PROGRESS: { label: 'In Progress', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  COMPLETED: { label: 'Completed', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
};

function formatCoord(val) {
  if (val == null) return '—';
  return Number(val).toFixed(4);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function TripCard({ trip, isSelected, onSelect }) {
  const config = STATUS_CONFIG[trip.status] || STATUS_CONFIG.COMPLETED;

  return (
    <div
      className={`trip-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(trip)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(trip)}
    >
      <div className="trip-card-header">
        <div className="trip-card-id">
          <span className="trip-card-id-label">Trip</span>
          <span className="trip-card-id-value">{trip.trip_id.slice(0, 8)}…</span>
        </div>
        <span
          className="trip-status-badge"
          style={{ color: config.color, background: config.bg }}
        >
          {config.label}
        </span>
      </div>

      <div className="trip-card-coords">
        <div className="trip-coord-row">
          <span className="coord-indicator pickup"></span>
          <span className="coord-text">
            {formatCoord(trip.pickup_lat)}, {formatCoord(trip.pickup_lng)}
          </span>
        </div>
        <div className="trip-coord-arrow">↓</div>
        <div className="trip-coord-row">
          <span className="coord-indicator dropoff"></span>
          <span className="coord-text">
            {formatCoord(trip.dropoff_lat)}, {formatCoord(trip.dropoff_lng)}
          </span>
        </div>
      </div>

      <div className="trip-card-footer">
        <span className="trip-card-time">{formatDate(trip.created_at)}</span>
        {isSelected && <span className="trip-card-selected-badge">Viewing</span>}
      </div>
    </div>
  );
}

export default function TripHistory({ onSelectTrip }) {
  const tripList = useTripStore((s) => s.tripList);
  const setTripList = useTripStore((s) => s.setTripList);
  const selectedHistoryTrip = useTripStore((s) => s.selectedHistoryTrip);
  const setSelectedHistoryTrip = useTripStore((s) => s.setSelectedHistoryTrip);
  const activeTripId = useTripStore((s) => s.activeTripId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  async function fetchTrips() {
    setLoading(true);
    setError(null);
    try {
      const trips = await listTrips();
      setTripList(trips);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      setError('Failed to load trip history.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrips();
  }, []);

  function handleSelectTrip(trip) {
    setSelectedHistoryTrip(trip);
    onSelectTrip?.();
  }

  const filteredTrips = tripList.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="trip-history">
      <div className="history-header">
        <div className="history-title-row">
          <h3 className="history-title">Trip History</h3>
          <button
            className="refresh-btn"
            onClick={fetchTrips}
            disabled={loading}
            title="Refresh"
          >
            <span className={loading ? 'spin' : ''}>↻</span>
          </button>
        </div>
        <p className="history-subtitle">
          {tripList.length} trip{tripList.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {['ALL', 'COMPLETED', 'TRIP_IN_PROGRESS', 'DRIVER_EN_ROUTE', 'SEARCHING_FOR_DRIVER'].map(
          (f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL'
                ? 'All'
                : f === 'COMPLETED'
                ? 'Done'
                : f === 'TRIP_IN_PROGRESS'
                ? 'Active'
                : f === 'DRIVER_EN_ROUTE'
                ? 'En Route'
                : 'Searching'}
            </button>
          )
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <span>Loading trips…</span>
        </div>
      )}

      {error && !loading && (
        <div className="history-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchTrips} className="retry-btn">Retry</button>
        </div>
      )}

      {!loading && !error && filteredTrips.length === 0 && (
        <div className="history-empty">
          <div className="empty-icon">🚕</div>
          <p>No trips found</p>
          <span>
            {filter === 'ALL'
              ? 'Create your first trip to get started!'
              : `No trips with status "${filter}"`}
          </span>
        </div>
      )}

      {!loading && !error && filteredTrips.length > 0 && (
        <div className="trips-list">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.trip_id}
              trip={trip}
              isSelected={selectedHistoryTrip?.trip_id === trip.trip_id}
              onSelect={handleSelectTrip}
            />
          ))}
        </div>
      )}
    </div>
  );
}