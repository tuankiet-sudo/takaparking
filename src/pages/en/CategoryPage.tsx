// src/pages/CategoryPage.tsx
// import React from 'react';
import { Box, Typography } from '@mui/material';
import CategoryListEn from '../../components/en/CategoryListEn'; // Import the new component
import SearchIcon from '@mui/icons-material/Search';
import { Toolbar, InputBase } from '@mui/material';

const CategoryPageEn = () => {
  return (
    <Box>
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
      <Typography 
        variant="h5" 
        sx={{ 
            fontWeight: 'bold', 
            padding: '16px 16px 0 16px' // Add padding
        }}
      >
        Product Categories
      </Typography>
      <CategoryListEn />
    </Box>
  );
};

export default CategoryPageEn;