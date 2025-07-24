// src/components/CategoryList.tsx
// import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import {
    StarBorder, Spa, Checkroom, Face, Man, ChildCare,
    CardTravel, Home, Computer, Fastfood, TwoWheeler,
} from '@mui/icons-material'; // Using placeholder icons
import { Link as RouterLink } from 'react-router-dom';

const categories = [
  { name: 'BRANDS', icon: <StarBorder sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'BEAUTY', icon: <Spa sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'INTERNATIONAL FASHION', icon: <Checkroom sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'FOR WOMEN', icon: <Face sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'FOR MEN', icon: <Man sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'FOR KIDS', icon: <ChildCare sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'SPORTS & TRAVEL', icon: <CardTravel sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'HOME & GIFTS', icon: <Home sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'TECH & ENTERTAINMENT', icon: <Computer sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'FOOD & CAKES', icon: <Fastfood sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'PARKING', icon: <TwoWheeler sx={{ color: 'white', fontSize: 32 }} />, path: '/en/parking' }
];

const CategoryListEn = () => {
    return (
        <Box sx={{ padding: '16px' }}>
            <Grid container spacing={2}>
                {categories.map((cat) => {
                    // This is the content for each grid item
                    const itemContent = (
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                backgroundColor: '#E53935', // Red color
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                aspectRatio: '1 / 1', // Keep it square
                                mb: 1 // Margin bottom for spacing
                            }}>
                               {cat.icon}
                            </Box>
                            <Typography variant="caption" sx={{
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                lineHeight: '1.2'
                            }}>
                                {cat.name}
                            </Typography>
                        </Box>
                    );

                    return (
                        <Grid size={{xs: 3}} key={cat.name}>
                            {/* If a path exists, wrap the content in a link. Otherwise, just render the content. */}
                            {cat.path ? (
                                <RouterLink to={cat.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {itemContent}
                                </RouterLink>
                            ) : (
                                itemContent
                            )}
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}


export default CategoryListEn;