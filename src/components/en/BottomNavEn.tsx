// src/components/BottomNav.tsx
// import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Apps';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagOutlined';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';

// Import Link and useLocation
import { Link, useLocation } from 'react-router-dom';

const BottomNavEn = () => {
    // Sync active state with the current URL path
    const { pathname } = useLocation();
    
    // Map paths to their corresponding value
    const pathToValue: { [key: string]: number } = {
        "/en/": 0,
        "/en/category": 1,
    };

    const value = pathToValue[pathname];

    return (
        <Paper 
            sx={{ 
                position: 'fixed', 
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '480px',
                zIndex: 1000 
            }} 
            elevation={3}
        >
            <BottomNavigation showLabels value={value}>
                <BottomNavigationAction label="Home page" icon={<HomeIcon />} component={Link} to="/en/" />
                <BottomNavigationAction label="Category" icon={<CategoryIcon />} component={Link} to="/en/category" />
                <BottomNavigationAction label="My Cart" icon={<ShoppingBagIcon />} />
                <BottomNavigationAction label="My Vouchers" icon={<ConfirmationNumberIcon />} />
                <BottomNavigationAction label="My Account" icon={<PersonIcon />} />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNavEn;