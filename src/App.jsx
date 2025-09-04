import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PigSales from './components/PigSales';
import BreedingStage from './components/stages/BreedingStage';
import GestationStage from './components/stages/GestationStage';
import FarrowingStage from './components/stages/FarrowingStage';
import NurseryStage from './components/stages/NurseryStage';
import FatteningStage from './components/stages/FatteningStage';
import Reports from './components/Reports';
import './config/aws-config';
import DriedStage from './components/stages/DriedStage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route
          path="/*"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="pb-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sales" element={<PigSales />} />
                    <Route path="/breeding" element={<BreedingStage />} />
                    <Route path="/gestation" element={<GestationStage />} />
                    <Route path="/farrowing" element={<FarrowingStage />} />
                    <Route path="/nursery" element={<NurseryStage />} />
                    <Route path="/fattening" element={<FatteningStage />} />
                    <Route path="/dried" element={<DriedStage />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;