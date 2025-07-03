// src/components/CategoryList.tsx
// import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import {
    StarBorder, Spa, Checkroom, Face, Man, ChildCare,
    CardTravel, Home, Computer, Fastfood, TwoWheeler,
} from '@mui/icons-material'; // Using placeholder icons
import { Link as RouterLink } from 'react-router-dom';

const categories = [
    { name: 'THƯƠNG HIỆU', icon: <StarBorder sx={{color: 'white', fontSize: 32}}/> },
    { name: 'SẮC ĐẸP', icon: <Spa sx={{color: 'white', fontSize: 32}}/> },
    { name: 'THỜI TRANG QUỐC TẾ', icon: <Checkroom sx={{color: 'white', fontSize: 32}}/> },
    { name: 'DÀNH CHO NỮ', icon: <Face sx={{color: 'white', fontSize: 32}}/> },
    { name: 'DÀNH CHO NAM', icon: <Man sx={{color: 'white', fontSize: 32}}/> },
    { name: 'DÀNH CHO BÉ', icon: <ChildCare sx={{color: 'white', fontSize: 32}}/> },
    { name: 'THỂ THAO VÀ DU LỊCH', icon: <CardTravel sx={{color: 'white', fontSize: 32}}/> },
    { name: 'NHÀ CỬA VÀ QUÀ TẶNG', icon: <Home sx={{color: 'white', fontSize: 32}}/> },
    { name: 'CÔNG NGHỆ VÀ GIẢI TRÍ', icon: <Computer sx={{color: 'white', fontSize: 32}}/> },
    { name: 'THỰC PHẨM VÀ BÁNH KEM', icon: <Fastfood sx={{color: 'white', fontSize: 32}}/> },
    { name: 'GỬI XE', icon: <TwoWheeler sx={{color: 'white', fontSize: 32}}/>, path: '/parking' }
];

const CategoryList = () => {
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


export default CategoryList;