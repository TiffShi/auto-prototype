import React, { useState } from 'react';
import MapView from './components/MapView/MapView.jsx';
import TripForm from './components/TripForm/TripForm.jsx';
import StatusTracker from './components/StatusTracker/StatusTracker.jsx';
import TripHistory from './components/TripHistory/TripHistory.jsx';
import useTripWebSocket from './hooks/useTripWebSocket.js';
import useTrips from './hooks/useTrips.js';
import useTripStore from './store/tripStore.js';
import './App.css';

export default function App() {
  const [sidebarTab, setSidebarTab] = useState('form'); // 'form' | 'history'
  const activeTripId = useTripStore((s) => s.activeTripId);

  // Initialize hooks
  useTrips();
  useTripWebSocket();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚗</span>
            <span className="logo-text">RideShare</span>
            <span className="logo-badge">LIVE</span>
          </div>
          <div className="tab-switcher">
            <button
              className={`tab-btn ${sidebarTab === 'form' ? 'active' : ''}`}
              onClick={() => setSidebarTab('form')}
            >
              New Trip
            </button>
            <button
              className={`tab-btn ${sidebarTab === 'history' ? 'active' : ''}`}
              onClick={() => setSidebarTab('history')}
            >
              History
            </button>
          </div>
        </div>

        <div className="sidebar-content">
          {sidebarTab === 'form' ? (
            <div className="form-section">
              <TripForm onTripCreated={() => setSidebarTab('form')} />
              {activeTripId && <StatusTracker />}
            </div>
          ) : (
            <TripHistory onSelectTrip={() => setSidebarTab('form')} />
          )}
        </div>
      </aside>

      {/* Map */}
      <main className="map-container">
        <MapView />
      </main>
    </div>
  );
}