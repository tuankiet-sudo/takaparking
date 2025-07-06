// src/pages/CategoryPage.tsx
// import React from 'react';
import { Box, Typography } from '@mui/material';
import CategoryList from '../components/CategoryList'; // Import the new component

const CategoryPage = () => {
  return (
    <Box>
      <Typography 
        variant="h5" 
        sx={{ 
            fontWeight: 'bold', 
            padding: '16px 16px 0 16px' // Add padding
        }}
      >
        Danh mục sản phẩm
      </Typography>
      <CategoryList />
    </Box>
  );
};

export default CategoryPage;