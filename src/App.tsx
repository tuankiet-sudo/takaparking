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
          
          {/* You can add more routes here for other pages */}
        </Routes>
      </Box>

      <BottomNav />
    </Box>
  );
}

export default App;