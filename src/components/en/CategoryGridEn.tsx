// import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import {
    StarBorder, Spa, Checkroom, Face, Man, ChildCare,
    CardTravel, SportsEsports, Home, Fastfood
} from '@mui/icons-material'; // Using placeholder icons

const categories = [
    { name: 'Brands', icon: <StarBorder sx={{color: 'white'}}/> },
    { name: 'Beauty', icon: <Spa sx={{color: 'white'}}/> },
    { name: 'International Fashion', icon: <Checkroom sx={{color: 'white'}}/> },
    { name: 'For Women', icon: <Face sx={{color: 'white'}}/> },
    { name: 'For Men', icon: <Man sx={{color: 'white'}}/> },
    { name: 'For Kids', icon: <ChildCare sx={{color: 'white'}}/> },
    { name: 'Sports & Travel', icon: <CardTravel sx={{color: 'white'}}/> },
    { name: 'Tech & Entertainment', icon: <SportsEsports sx={{color: 'white'}}/> },
    { name: 'Home & Gifts', icon: <Home sx={{color: 'white'}}/> },
    { name: 'Food & More', icon: <Fastfood sx={{color: 'white'}}/> },
];

const CategoryGridEn = () => {
    return (
        <Box sx={{ padding: '16px' }}>
            <Grid container spacing={1}>
                {categories.map((cat, index) => (
                    <Grid size={{xs: 2.4}} key={index} sx={{ textAlign: 'center' }}>
                        <Box sx={{
                            backgroundColor: '#E53935', // Red color
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            aspectRatio: '1 / 1'
                        }}>
                           {cat.icon}
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem', lineHeight: '1.2' }}>
                            {cat.name}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default CategoryGridEn;