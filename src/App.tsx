// src/App.tsx
// import React from 'react';
import { Box, Typography, Card, CardMedia } from '@mui/material';
import Header from './components/Header';
import CategoryGrid from './components/CategoryGrid';
import BottomNav from './components/BottomNav';
import './App.css'; // We might add specific app styles here

// Placeholder for product data
const beautyProducts = [
    { name: "KIEHL'S", image: "/kiehls.jpg" }, // Replace with actual image
    { name: "SK-II", image: "/skii.jpg" },   // Replace with actual image
    { name: "DOLCE", image: "/dolce.webp" }, // Replace with actual image
];

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        {/* Main scrollable content area */}
        <Box component="main" sx={{ flexGrow: 1, pb: '70px' /* padding bottom to avoid overlap with bottom nav */ }}>
            {/* Promotional Banner */}
            <Box sx={{ padding: '0 16px' }}>
                 <Card sx={{ position: 'relative', borderRadius: '16px' }}>
                    <CardMedia
                        component="img"
                        image="/promo-banner.jpg" // Create a banner image
                        alt="Nhà cửa & Gia dụng"
                    />
                 </Card>
            </Box>

            <CategoryGrid />
            
            {/* Beauty Care Section */}
            <Box sx={{ padding: '0 16px', mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    CHĂM SÓC SẮC ĐẸP
                </Typography>
                <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 2 }}>
                    {beautyProducts.map(product => (
                        <Card key={product.name} sx={{ minWidth: 140, boxShadow: 'none', border: '1px solid #eee', borderRadius: '12px' }}>
                           <CardMedia
                                component="img"
                                height="140"
                                image={product.image}
                                alt={product.name}
                                sx={{ objectFit: 'contain', padding: '8px' }}
                           />
                           <Typography sx={{ textAlign: 'center', fontWeight: 'bold', pb: 2 }}>
                                {product.name}
                           </Typography>
                        </Card>
                    ))}
                </Box>
            </Box>
        </Box>

        <BottomNav />
    </Box>
  );
}

export default App;