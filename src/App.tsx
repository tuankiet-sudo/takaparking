// src/App.tsx
// import React from 'react';
import { Box } from '@mui/material';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import './App.css';
// Import router components and pages
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ParkingPage from './pages/ParkingPage';
import SaveSlotPage from './pages/SaveSlotPage';
import FindVehiclePage from './pages/FindVehiclePage';
import NavigateToSlotPage from './pages/NavigateToSlotPage';
import FindSlotPage from './pages/FindSlotPage';
import FindSlotMapPage from './pages/FindSlotMapPage';
import PaymentPage from './pages/PaymentPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      {/* Main scrollable content area */}
      <Box component="main" sx={{ flexGrow: 1, pb: '70px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/parking" element={<ParkingPage />} />
          <Route path="/parking/save-slot" element={<SaveSlotPage />} />
          <Route path="/parking/find-vehicle" element={<FindVehiclePage />} />
          <Route path="/parking/find-vehicle/navigate" element={<NavigateToSlotPage />} />
          <Route path="/parking/find-slot" element={<FindSlotPage />} />
          <Route path="/parking/find-slot/map/:basementId" element={<FindSlotMapPage />} />
          <Route path="/parking/pay-fee" element={<PaymentPage />} />
          <Route path="/parking/pay-fee/confirm" element={<PaymentConfirmationPage />} />
          {/* You can add more routes here for other pages */}
        </Routes>
      </Box>

      <BottomNav />
    </Box>
  );
}

export default App;