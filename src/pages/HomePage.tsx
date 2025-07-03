// src/pages/HomePage.tsx
// import React from 'react';
import { Box, Typography, Card, CardMedia } from '@mui/material';
import CategoryGrid from '../components/CategoryGrid';

const beautyProducts = [
    { name: "KIEHL'S", image: "/kiehls.jpg" },
    { name: "SK-II", image: "/skii.jpg" },
    { name: "DOLCE", image: "/dolce.webp" },
];

const HomePage = () => {
  return (
    <>
      {/* Promotional Banner */}
      <Box sx={{ padding: '0 16px' }}>
         <Card sx={{ position: 'relative', borderRadius: '16px' }}>
            <CardMedia
                component="img"
                image="/promo-banner.jpg"
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
    </>
  );
}

export default HomePage;