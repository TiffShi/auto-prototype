import React from 'react';
import useTripStore from '../../store/tripStore.js';
import './StatusTracker.css';

const STEPS = [
  {
    key: 'SEARCHING_FOR_DRIVER',
    label: 'Finding Driver',
    description: 'Matching you with a nearby driver',
    icon: '🔍',
  },
  {
    key: 'DRIVER_EN_ROUTE',
    label: 'Driver En Route',
    description: 'Driver is heading to your pickup',
    icon: '🚗',
  },
  {
    key: 'TRIP_IN_PROGRESS',
    label: 'Trip In Progress',
    description: 'On the way to your destination',
    icon: '🛣️',
  },
  {
    key: 'COMPLETED',
    label: 'Completed',
    description: 'You have arrived!',
    icon: '✅',
  },
];

const STATUS_ORDER = STEPS.map((s) => s.key);

function getStepState(stepKey, currentStatus) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const stepIdx = STATUS_ORDER.indexOf(stepKey);

  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

function formatCoord(val) {
  if (val == null) return '—';
  return Number(val).toFixed(4);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function StatusTracker() {
  const currentStatus = useTripStore((s) => s.currentStatus);
  const activeTrip = useTripStore((s) => s.activeTrip);
  const activeTripId = useTripStore((s) => s.activeTripId);
  const carPosition = useTripStore((s) => s.carPosition);
  const simulationComplete = useTripStore((s) => s.simulationComplete);

  if (!activeTripId) return null;

  const displayStatus = currentStatus || 'SEARCHING_FOR_DRIVER';

  return (
    <div className="status-tracker">
      {/* Trip ID header */}
      <div className="tracker-header">
        <div className="tracker-title-row">
          <h3 className="tracker-title">Live Trip Status</h3>
          {simulationComplete ? (
            <span className="status-badge completed">Completed</span>
          ) : (
            <span className="status-badge live">
              <span className="live-dot"></span>
              Live
            </span>
          )}
        </div>
        <div className="trip-id-display">
          <span className="trip-id-label">Trip ID</span>
          <span className="trip-id-value" title={activeTripId}>
            {activeTripId.slice(0, 8)}…
          </span>
        </div>
      </div>

      {/* Step progress */}
      <div className="steps-container">
        {STEPS.map((step, idx) => {
          const state = getStepState(step.key, displayStatus);
          return (
            <div key={step.key} className={`step-item ${state}`}>
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className={`step-connector ${state === 'completed' ? 'filled' : ''}`}></div>
              )}

              <div className="step-left">
                <div className={`step-circle ${state}`}>
                  {state === 'completed' ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : state === 'active' ? (
                    <span className="step-icon">{step.icon}</span>
                  ) : (
                    <span className="step-number">{idx + 1}</span>
                  )}
                </div>
              </div>

              <div className="step-content">
                <div className="step-label">{step.label}</div>
                <div className="step-description">{step.description}</div>
                {state === 'active' && (
                  <div className="step-progress-bar">
                    <div className="step-progress-fill"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trip metadata */}
      {activeTrip && (
        <div className="trip-meta">
          <div className="meta-row">
            <span className="meta-label">Created</span>
            <span className="meta-value">{formatDate(activeTrip.created_at)}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Pickup</span>
            <span className="meta-value">
              {formatCoord(activeTrip.pickup_lat)}, {formatCoord(activeTrip.pickup_lng)}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Drop-off</span>
            <span className="meta-value">
              {formatCoord(activeTrip.dropoff_lat)}, {formatCoord(activeTrip.dropoff_lng)}
            </span>
          </div>
          {carPosition && (
            <div className="meta-row">
              <span className="meta-label">Car Position</span>
              <span className="meta-value car-pos">
                <span className="car-pos-dot"></span>
                {formatCoord(carPosition.lat)}, {formatCoord(carPosition.lng)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}