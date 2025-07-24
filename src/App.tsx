// src/App.tsx
// import React from 'react';
import { Box } from '@mui/material';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import './App.css';
// Import router components and pages
import { Routes, Route, useLocation } from 'react-router-dom';
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
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PreBookingPage from './pages/PreBookingPage';
import HomePageEn from './pages/en/HomePage';
import CategoryPageEn from './pages/en/CategoryPage';
import ParkingPageEn from './pages/en/ParkingPage';
import SaveSlotPageEn from './pages/en/SaveSlotPage';
import FindVehiclePageEn from './pages/en/FindVehiclePage';
import NavigateToSlotPageEn from './pages/en/NavigateToSlotPage';
import FindSlotPageEn from './pages/en/FindSlotPage';
import FindSlotMapPageEn from './pages/en/FindSlotMapPage';
import PaymentPageEn from './pages/en/PaymentPage';
import PaymentConfirmationPageEn from './pages/en/PaymentConfirmationPage';
import BookingPageEn from './pages/en/BookingPage';
import BookingConfirmationPageEn from './pages/en/BookingConfirmationPage';
import PaymentSuccessPageEn from './pages/en/PaymentSuccessPage';
import PreBookingPageEn from './pages/en/PreBookingPage';
import HeaderEn from './components/en/HeaderEn';
import BottomNavEn from './components/en/BottomNavEn';

function App() {
  const location = useLocation();
  const isEnglish = location.pathname.startsWith('/en');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {isEnglish ? <HeaderEn /> : <Header />}
      
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
          <Route path="/parking/pay-fee/confirm/success" element={<PaymentSuccessPage />} />
          <Route path="/parking/book-slot" element={<PreBookingPage />} />
          <Route path="/parking/book-slot/:vehicleType" element={<BookingPage />} />
          <Route path="/parking/book-slot/success" element={<BookingConfirmationPage />} />
          {/* You can add more routes here for other pages */}
          <Route path="/en/" element={<HomePageEn />} />
          <Route path="/en/category" element={<CategoryPageEn />} />
          <Route path="/en/parking" element={<ParkingPageEn />} />
          <Route path="/en/parking/save-slot" element={<SaveSlotPageEn />} />
          <Route path="/en/parking/find-vehicle" element={<FindVehiclePageEn />} />
          <Route path="/en/parking/find-vehicle/navigate" element={<NavigateToSlotPageEn />} />
          <Route path="/en/parking/find-slot" element={<FindSlotPageEn />} />
          <Route path="/en/parking/find-slot/map/:basementId" element={<FindSlotMapPageEn />} />
          <Route path="/en/parking/pay-fee" element={<PaymentPageEn />} />
          <Route path="/en/parking/pay-fee/confirm" element={<PaymentConfirmationPageEn />} />
          <Route path="/en/parking/pay-fee/confirm/success" element={<PaymentSuccessPageEn />} />
          <Route path="/en/parking/book-slot" element={<PreBookingPageEn />} />
          <Route path="/en/parking/book-slot/:vehicleType" element={<BookingPageEn />} />
          <Route path="/en/parking/book-slot/success" element={<BookingConfirmationPageEn />} />
        </Routes>
      </Box>

      {isEnglish? <BottomNavEn /> : <BottomNav />}
    </Box>
  );
}

export default App;