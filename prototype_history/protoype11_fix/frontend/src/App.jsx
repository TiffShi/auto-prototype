import React, { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';
import useWaterStore from './store/useWaterStore.js';
import useReminder from './hooks/useReminder.js';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '💧' },
  { id: 'history',   label: 'History',   icon: '📊' },
  { id: 'settings',  label: 'Settings',  icon: '⚙️'  },
];

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const { fetchSettings, fetchTodaySummary } = useWaterStore();

  // Bootstrap data on mount
  useEffect(() => {
    fetchSettings();
    fetchTodaySummary();
  }, [fetchSettings, fetchTodaySummary]);

  // Activate reminder hook (reads from store internally)
  useReminder();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'history':   return <History />;
      case 'settings':  return <Settings />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <span className="font-bold text-blue-700 text-lg tracking-tight">
              HydroTrack
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`nav-link ${
                  activePage === item.id ? 'nav-link-active' : 'nav-link-inactive'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-4">
        Stay hydrated! 💧 HydroTrack v1.0
      </footer>
    </div>
  );
}