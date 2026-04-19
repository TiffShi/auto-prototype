import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StreamProvider } from './context/StreamContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import HomePage from './pages/HomePage.jsx';
import BroadcasterPage from './pages/BroadcasterPage.jsx';
import ViewerLobbyPage from './pages/ViewerLobbyPage.jsx';
import WatchPage from './pages/WatchPage.jsx';
import Navbar from './components/shared/Navbar.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <StreamProvider>
        <ChatProvider>
          <div className="app-root">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/broadcast" element={<BroadcasterPage />} />
                <Route path="/streams" element={<ViewerLobbyPage />} />
                <Route path="/watch/:streamId" element={<WatchPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </ChatProvider>
      </StreamProvider>
    </BrowserRouter>
  );
}