// src/components/Header.tsx
import { AppBar, Toolbar, Box, IconButton, Badge } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LanguageIcon from '@mui/icons-material/Language'; // Import the language icon
import { useLocation, useNavigate } from 'react-router-dom'; // Import router hooks

const HeaderEn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLanguageSwitch = () => {
    const currentPath = location.pathname;
    const isEnglish = currentPath.startsWith('/en');

    let newPath;
    if (isEnglish) {
      // Switch from English to Vietnamese
      newPath = currentPath === '/en' ? '/' : currentPath.substring(3);
    } else {
      // Switch from Vietnamese to English
      newPath = `/en${currentPath}`;
    }
    navigate(newPath);
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none' }}>
      <Toolbar>
        {/* Takashimaya Logo */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img src="/takashimaya-logo.png" alt="Takashimaya Logo" style={{height: '24px', marginRight: '8px'}} />
        </Box>
        
        {/* Language Switch Icon Button */}
        <IconButton size="large" color="inherit" onClick={handleLanguageSwitch}>
            <LanguageIcon />
        </IconButton>

        <IconButton size="large" color="inherit">
            <ChatBubbleOutlineIcon />
        </IconButton>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={11} color="error">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderEn;