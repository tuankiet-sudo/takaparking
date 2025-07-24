// import React from 'react';
import { AppBar, Toolbar, Box, IconButton, Badge } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
// For Zalo and the main logo, you would typically use an <img> or <svg>
// Let's use placeholders for now.
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // Placeholder for Zalo

const HeaderEn = () => {
  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none' }}>
      <Toolbar>
        {/* Placeholder for Takashimaya Logo */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img src="/takashimaya-logo.png" alt="Takashimaya Logo" style={{height: '24px', marginRight: '8px'}} />
        </Box>
        <IconButton size="large" color="inherit">
            <ChatBubbleOutlineIcon />
        </IconButton>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={11} color="error">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Toolbar>
      {/* <Toolbar sx={{ minHeight: '48px !important', padding: '0 16px 8px 16px' }}>
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
                  placeholder="Bạn muốn tìm gì hôm nay..."
                  sx={{ ml: 1, flex: 1, fontSize: '0.9rem' }}
              />
          </Box>
      </Toolbar> */}
    </AppBar>
  );
};

export default HeaderEn;