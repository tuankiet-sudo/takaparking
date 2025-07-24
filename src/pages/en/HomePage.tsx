// src/pages/HomePage.tsx
// import React from 'react';
import { Box, Typography, Card, CardMedia } from '@mui/material';
import CategoryGridEn from '../../components/en/CategoryGridEn';
import SearchIcon from '@mui/icons-material/Search';
import { Toolbar, InputBase } from '@mui/material';

const beautyProducts = [
    { name: "KIEHL'S", image: "/kiehls.jpg" },
    { name: "SK-II", image: "/skii.jpg" },
    { name: "DOLCE", image: "/dolce.webp" },
];

const HomePageEn = () => {
  return (
    <>
    <Toolbar sx={{ minHeight: '48px !important', padding: '0 16px 8px 16px' }}>
          <Box sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '20px',
              padding: '4px 12px'
          }}>
              <SearchIcon sx={{ color: 'gray' }}/>
              <InputBase
                  placeholder="What do you want to buy today..."
                  sx={{ ml: 1, flex: 1, fontSize: '0.9rem' }}
              />
          </Box>
      </Toolbar>
      {/* Promotional Banner */}
      <Box sx={{ padding: '0 16px' }}>
         <Card sx={{ position: 'relative', borderRadius: '16px' }}>
            <CardMedia
                component="img"
                image="/promo-banner.jpg"
                alt="Home & Appliances"
            />
         </Card>
      </Box>

      <CategoryGridEn />

      {/* Beauty Care Section */}
      <Box sx={{ padding: '0 16px', mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            BEAUTY & PERSONAL CARE
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

export default HomePageEn;