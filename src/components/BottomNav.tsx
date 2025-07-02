// src/components/BottomNav.tsx

import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Apps';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagOutlined';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';

const BottomNav = () => {
    const [value, setValue] = React.useState(0);

    return (
        // The change is in the 'sx' prop of this Paper component
        <Paper 
            sx={{ 
                position: 'fixed', 
                bottom: 0,
                // These 4 lines are the updated code
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '480px', // Same max-width as the #root container
                zIndex: 1000 
            }} 
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_, newValue) => {
                    setValue(newValue);
                }}
            >
                <BottomNavigationAction label="Trang chủ" icon={<HomeIcon />} />
                <BottomNavigationAction label="Danh mục" icon={<CategoryIcon />} />
                <BottomNavigationAction label="Giỏ hàng" icon={<ShoppingBagIcon />} />
                <BottomNavigationAction label="Ví Voucher" icon={<ConfirmationNumberIcon />} />
                <BottomNavigationAction label="Tài khoản" icon={<PersonIcon />} />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;