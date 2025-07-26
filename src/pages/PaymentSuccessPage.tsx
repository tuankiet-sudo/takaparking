import React from 'react';
import { Box, Typography, Paper, IconButton, Button, Stack, Divider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// Helper for detail rows
const DetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
        {icon}
        <Typography sx={{ color: 'text.secondary', flex: 1, textAlign: 'start' }}>{label}</Typography>
        <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>{value}</Typography>
    </Stack>
);

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const { vehicleId } = useParams<{ vehicleId: string }>();

    // --- Data & Time Calculation ---
    // In a real app, this data would be fetched or passed from the previous page.
    const paymentTime = new Date();
    const exitByTime = new Date(paymentTime.getTime() + 10 * 60 * 1000); // Add 10 minutes

    const formatDateTime = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} | ${hours}:${minutes}`;
    };
    
    const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const transaction = {
        id: '#2534003',
        licensePlate: vehicleId || '59L3-44559',
        paymentTimestamp: formatDateTime(paymentTime),
        location: 'Takashimaya',
        exitByTimestamp: `${formatDateTime(exitByTime)}`
    };

    return (
        <Box sx={{ bgcolor: '#f7f7f7', maxHeight: '100vh' }}>
            {/* --- Header --- */}
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate('/parking')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Thanh toán
                    </Typography>
                </Box>
            </Paper>

            {/* --- Main Content --- */}
            <Box sx={{ p: 2 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: 'white' }}>
                    {/* --- Success Icon and Message --- */}
                    <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 70 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Thanh toán thành công</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{transaction.paymentTimestamp}</Typography>
                    </Stack>

                    {/* --- Transaction Details --- */}
                    <Stack divider={<Divider flexItem />}>
                        <DetailRow icon={<ReceiptLongIcon color="action" />} label="Giao dịch" value={transaction.id} />
                        <DetailRow icon={<ConfirmationNumberIcon color="action" />} label="Biển số" value={transaction.licensePlate} />
                        <DetailRow icon={<AccessTimeIcon color="action" />} label="Thời gian" value={transaction.paymentTimestamp} />
                        <DetailRow icon={<LocationOnIcon color="action" />} label="Vị trí" value={transaction.location} />
                    </Stack>

                    {/* --- Exit Warning --- */}
                    <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 3, fontWeight: 'medium' }}>
                        Vui lòng lấy xe trước {formatTime(exitByTime)} ngày {formatDateTime(exitByTime).split(' | ')[0]} để tránh phát sinh phí giữ xe
                    </Typography>
                </Paper>

            </Box>

            {/* --- Footer Button --- */}
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/parking')}
                    sx={{
                        py: 1,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        backgroundColor: '#E53935',
                        maxWidth: '200px',
                        '&:hover': { backgroundColor: '#C62828' }
                    }}
                >
                    Hoàn tất
                </Button>
        </Box>
    );
};

export default PaymentSuccessPage;
