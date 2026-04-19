import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SelectionPage from './pages/SelectionPage.jsx';
import GardenPage from './pages/GardenPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectionPage />} />
        <Route path="/garden" element={<GardenPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}