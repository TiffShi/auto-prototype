import React, { useState } from 'react';
import useTrips from '../../hooks/useTrips.js';
import useTripStore from '../../store/tripStore.js';
import './TripForm.css';

// Preset locations around London
const PRESETS = [
  {
    label: 'London City → Canary Wharf',
    pickup_lat: 51.5074,
    pickup_lng: -0.1278,
    dropoff_lat: 51.5054,
    dropoff_lng: -0.0235,
  },
  {
    label: 'Heathrow → Hyde Park',
    pickup_lat: 51.4700,
    pickup_lng: -0.4543,
    dropoff_lat: 51.5073,
    dropoff_lng: -0.1657,
  },
  {
    label: 'King\'s Cross → Greenwich',
    pickup_lat: 51.5308,
    pickup_lng: -0.1238,
    dropoff_lat: 51.4826,
    dropoff_lng: -0.0077,
  },
  {
    label: 'Shoreditch → Brixton',
    pickup_lat: 51.5227,
    pickup_lng: -0.0796,
    dropoff_lat: 51.4613,
    dropoff_lng: -0.1156,
  },
];

const DEFAULT_FORM = {
  pickup_lat: '51.5074',
  pickup_lng: '-0.1278',
  dropoff_lat: '51.5054',
  dropoff_lng: '-0.0235',
};

export default function TripForm({ onTripCreated }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(0);

  const { createTrip } = useTrips();
  const activeTripId = useTripStore((s) => s.activeTripId);
  const currentStatus = useTripStore((s) => s.currentStatus);
  const simulationComplete = useTripStore((s) => s.simulationComplete);

  const isActiveTrip =
    activeTripId && currentStatus && currentStatus !== 'COMPLETED';

  function handlePreset(idx) {
    const p = PRESETS[idx];
    setSelectedPreset(idx);
    setForm({
      pickup_lat: String(p.pickup_lat),
      pickup_lng: String(p.pickup_lng),
      dropoff_lat: String(p.dropoff_lat),
      dropoff_lng: String(p.dropoff_lng),
    });
    setError(null);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSelectedPreset(null);
    setError(null);
  }

  function validate() {
    const lat = (v) => !isNaN(v) && v >= -90 && v <= 90;
    const lng = (v) => !isNaN(v) && v >= -180 && v <= 180;

    if (!lat(parseFloat(form.pickup_lat))) return 'Invalid pickup latitude (-90 to 90)';
    if (!lng(parseFloat(form.pickup_lng))) return 'Invalid pickup longitude (-180 to 180)';
    if (!lat(parseFloat(form.dropoff_lat))) return 'Invalid drop-off latitude (-90 to 90)';
    if (!lng(parseFloat(form.dropoff_lng))) return 'Invalid drop-off longitude (-180 to 180)';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createTrip({
        pickup_lat: parseFloat(form.pickup_lat),
        pickup_lng: parseFloat(form.pickup_lng),
        dropoff_lat: parseFloat(form.dropoff_lat),
        dropoff_lng: parseFloat(form.dropoff_lng),
      });
      onTripCreated?.();
    } catch (err) {
      console.error('Failed to create trip:', err);
      setError(err?.response?.data?.detail || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="trip-form-card">
      <div className="form-card-header">
        <h2 className="form-title">Book a Ride</h2>
        <p className="form-subtitle">Enter coordinates or choose a preset route</p>
      </div>

      {/* Preset buttons */}
      <div className="presets-section">
        <label className="field-label">Quick Routes</label>
        <div className="presets-grid">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className={`preset-btn ${selectedPreset === idx ? 'active' : ''}`}
              onClick={() => handlePreset(idx)}
              disabled={isActiveTrip}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="coord-form">
        {/* Pickup */}
        <div className="coord-group">
          <div className="coord-group-header">
            <span className="coord-dot pickup"></span>
            <span className="coord-group-label">Pickup Location</span>
          </div>
          <div className="coord-inputs">
            <div className="field">
              <label className="field-label" htmlFor="pickup_lat">Latitude</label>
              <input
                id="pickup_lat"
                name="pickup_lat"
                type="number"
                step="any"
                value={form.pickup_lat}
                onChange={handleChange}
                className="coord-input"
                placeholder="51.5074"
                disabled={isActiveTrip}
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="pickup_lng">Longitude</label>
              <input
                id="pickup_lng"
                name="pickup_lng"
                type="number"
                step="any"
                value={form.pickup_lng}
                onChange={handleChange}
                className="coord-input"
                placeholder="-0.1278"
                disabled={isActiveTrip}
                required
              />
            </div>
          </div>
        </div>

        {/* Dropoff */}
        <div className="coord-group">
          <div className="coord-group-header">
            <span className="coord-dot dropoff"></span>
            <span className="coord-group-label">Drop-off Location</span>
          </div>
          <div className="coord-inputs">
            <div className="field">
              <label className="field-label" htmlFor="dropoff_lat">Latitude</label>
              <input
                id="dropoff_lat"
                name="dropoff_lat"
                type="number"
                step="any"
                value={form.dropoff_lat}
                onChange={handleChange}
                className="coord-input"
                placeholder="51.5054"
                disabled={isActiveTrip}
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="dropoff_lng">Longitude</label>
              <input
                id="dropoff_lng"
                name="dropoff_lng"
                type="number"
                step="any"
                value={form.dropoff_lng}
                onChange={handleChange}
                className="coord-input"
                placeholder="-0.0235"
                disabled={isActiveTrip}
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="form-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || isActiveTrip}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner"></span>
              Creating Trip…
            </span>
          ) : isActiveTrip ? (
            '🚗 Trip In Progress…'
          ) : (
            '🚀 Start Trip'
          )}
        </button>
      </form>
    </div>
  );
}