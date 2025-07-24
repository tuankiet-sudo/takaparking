import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

// Helper component for instruction steps
const InstructionStep = ({ number, title, subtitle }: { number: string, title: string, subtitle: string, icon: React.ReactNode }) => (
    <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: '16px', mb: 2, bgcolor: 'white' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#E0E0E0', mr: 2 }}>{number}</Typography>
        <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
        </Box>
        {/* <Box sx={{ fontSize: 40, color: 'primary.main' }}>{icon}</Box> */}
    </Paper>
);

const PaymentPageEn = () => {
    const navigate = useNavigate();
    const [vehicleId, setVehicleId] = useState('');

    const handleLookup = () => {
        if (vehicleId.trim()) {
            // Navigate to the confirmation page with the vehicle ID as a parameter
            navigate(`/en/parking/pay-fee/confirm`);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f7f7f7' }}>
            {/* --- Header --- */}
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Payment
                    </Typography>
                </Box>
            </Paper>

            {/* --- Main Content --- */}
            <Box sx={{ p: 2 }}>
                {/* --- Input Form --- */}
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="License plate or parking card number. VD: 59L3-44559"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleLookup} edge="end" disabled={!vehicleId.trim()}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: { borderRadius: '50px', bgcolor: 'white' }
                    }}
                    sx={{ mb: 3 }}
                />

                {/* --- Instruction Steps --- */}
                <InstructionStep
                    number="01"
                    subtitle="Nhập thông tin biển số xe/ mã thẻ"
                    title="Search your vehicle license plate or parking card number in the search box"
                    icon={<SearchIcon fontSize="inherit" />}
                />
                <InstructionStep
                    number="02"
                    subtitle="Chụp mã Barcode hoá đơn và mã Voucher"
                    title="Take a photo of Barcode bill and Voucher (if any)"
                    icon={<i className="fa-solid fa-barcode" style={{fontSize: '32px'}}></i>}
                />
                <InstructionStep
                    number="03"
                    subtitle="Chọn phương thức thanh toán"
                    title="Choose payment method that suits you"
                    icon={<i className="fa-solid fa-credit-card" style={{fontSize: '32px'}}></i>}
                />
                <InstructionStep
                    number="04"
                    subtitle="Xác nhận thanh toán"
                    title="Confirm your payment"
                    icon={<i className="fa-solid fa-credit-card" style={{fontSize: '32px'}}></i>}
                />
            </Box>
        </Box>
    );
};

export default PaymentPageEn;
