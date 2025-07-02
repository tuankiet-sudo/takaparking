// import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import {
    StarBorder, Spa, Checkroom, Face, Man, ChildCare,
    CardTravel, SportsEsports, Home, Fastfood
} from '@mui/icons-material'; // Using placeholder icons

const categories = [
    { name: 'Thương hiệu', icon: <StarBorder sx={{color: 'white'}}/> },
    { name: 'Sắc đẹp', icon: <Spa sx={{color: 'white'}}/> },
    { name: 'Thời trang quốc tế', icon: <Checkroom sx={{color: 'white'}}/> },
    { name: 'Dành cho nữ', icon: <Face sx={{color: 'white'}}/> },
    { name: 'Dành cho nam', icon: <Man sx={{color: 'white'}}/> },
    { name: 'Dành cho bé', icon: <ChildCare sx={{color: 'white'}}/> },
    { name: 'Thể thao & Du lịch', icon: <CardTravel sx={{color: 'white'}}/> },
    { name: 'Công nghệ & Giải trí', icon: <SportsEsports sx={{color: 'white'}}/> },
    { name: 'Nhà cửa & Quà tặng', icon: <Home sx={{color: 'white'}}/> },
    { name: 'Thực phẩm &...', icon: <Fastfood sx={{color: 'white'}}/> },
];

const CategoryGrid = () => {
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

export default CategoryGrid;