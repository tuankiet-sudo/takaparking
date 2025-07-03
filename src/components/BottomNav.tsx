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

const BottomNav = () => {
    // Sync active state with the current URL path
    const { pathname } = useLocation();
    
    // Map paths to their corresponding value
    const pathToValue: { [key: string]: number } = {
        "/": 0,
        "/category": 1,
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
                <BottomNavigationAction label="Trang chủ" icon={<HomeIcon />} component={Link} to="/" />
                <BottomNavigationAction label="Danh mục" icon={<CategoryIcon />} component={Link} to="/category" />
                <BottomNavigationAction label="Giỏ hàng" icon={<ShoppingBagIcon />} />
                <BottomNavigationAction label="Ví Voucher" icon={<ConfirmationNumberIcon />} />
                <BottomNavigationAction label="Tài khoản" icon={<PersonIcon />} />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;