import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/gameStore.js';
import LoginPage from './pages/LoginPage.jsx';
import LobbyPage from './pages/LobbyPage.jsx';
import DeckBuilderPage from './pages/DeckBuilderPage.jsx';
import GamePage from './pages/GamePage.jsx';
import CollectionPage from './pages/CollectionPage.jsx';

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/lobby"
          element={
            <ProtectedRoute>
              <LobbyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <CollectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deck-builder"
          element={
            <ProtectedRoute>
              <DeckBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deck-builder/:deckId"
          element={
            <ProtectedRoute>
              <DeckBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:roomCode"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/lobby" replace />} />
        <Route path="*" element={<Navigate to="/lobby" replace />} />
      </Routes>
    </BrowserRouter>
  );
}