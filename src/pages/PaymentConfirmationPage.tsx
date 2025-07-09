import  { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Stack, Divider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Button from '@mui/material/Button'; // Ensure Button is imported if used elsewhere

// Helper for detail rows
const DetailRow = ({ label, value, valueColor = 'text.primary' }: { label: string, value: string, valueColor?: string }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
        <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontWeight: 'bold', color: valueColor }}>{value}</Typography>
    </Box>
);

const PaymentConfirmationPage = () => {
    const navigate = useNavigate();
    const { vehicleId } = useParams<{ vehicleId: string }>();
    const [countdown, setCountdown] = useState(10);
    const paymentTime = new Date(); // Current time as payment time
    const timeInTime = new Date(paymentTime.getTime() - 215 * 60 * 1000); // Simulate a time in 3 hours and 35 minutes ago

    const formatDateTime = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} | ${hours}:${minutes}`;
    };

    // Hardcoded data for the demo
    const transaction = {
        id: '#2534003',
        imageUrl: '/vehicle.jpg',
        licensePlate: vehicleId || '59L3-44559', // Use vehicleId from params
        timeIn: formatDateTime(timeInTime), // Format the time in
        location: 'Takashimaya',
        fee: '5,000 VND',
        duration: '3 giờ 35 phút',
        discount: '0 VND',
        total: '5,000 VND'
    };

    // --- Countdown Timer Logic ---
    useEffect(() => {
        if (countdown <= 0) {
            navigate('/parking/pay-fee/confirm/success');
            return;
        }

        const timer = setInterval(() => {
            setCountdown(prevCountdown => prevCountdown - 1);
        }, 1000);

        // Cleanup the interval on component unmount
        return () => clearInterval(timer);
    }, [countdown, navigate]);

    return (
        <Box sx={{ bgcolor: '#f7f7f7', pb: 4 }}>
            {/* --- Header --- */}
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Xác nhận thanh toán
                    </Typography>
                </Box>
            </Paper>

            {/* --- Main Content --- */}
            <Box sx={{ p: 2 }}>
                {/* --- Transaction Info --- */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Giao dịch</Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>{transaction.id}</Typography>
                    </Box>
                    <Box sx={{ borderRadius: '12px', overflow: 'hidden', mb: 2 }}>
                        <img src={transaction.imageUrl} alt="Vehicle" style={{ width: '100%', display: 'block' }} />
                    </Box>
                    <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <ConfirmationNumberIcon sx={{ color: 'text.secondary' }} />
                            <Typography>Biển số: <strong>{transaction.licensePlate}</strong></Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <AccessTimeIcon sx={{ color: 'text.secondary' }} />
                            <Typography>Thời gian: <strong>{transaction.timeIn}</strong></Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <LocationOnIcon sx={{ color: 'text.secondary' }} />
                            <Typography>Vị trí: <strong>{transaction.location}</strong></Typography>
                        </Stack>
                    </Stack>
                </Paper>

                {/* --- Invoice/Discount --- */}
                <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: '16px', bgcolor: 'white' }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Hoá đơn / Mã giảm giá</Typography>
                    <Button variant="outlined" fullWidth startIcon={<CameraAltIcon />} sx={{ justifyContent: 'flex-start', p: 1.5, color: 'text.secondary', borderColor: '#e0e0e0' }}>
                        Chụp mã hoá đơn / voucher
                    </Button>
                </Paper>

                {/* --- Fee Details --- */}
                <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: '16px', bgcolor: 'white' }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Thông tin phí</Typography>
                    <Stack spacing={1} divider={<Divider flexItem />}>
                        <DetailRow label="Phí" value={transaction.fee} />
                        <DetailRow label="Thời gian lưu bãi" value={transaction.duration} />
                        <DetailRow label="Giảm giá" value={transaction.discount} />
                        <DetailRow label="Tổng" value={transaction.total} valueColor="red" />
                    </Stack>
                </Paper>

                {/* --- QR Code and Countdown Section --- */}
                <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: '16px', bgcolor: 'white', textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Vui lòng quét mã QR để thanh toán</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <img src="/qrcode.png" alt="Payment QR Code" style={{ width: 200, height: 200 }} />
                    </Box>
                    {/* <Typography variant="body2" color="text.secondary">
                        Tự động chuyển trang sau...
                    </Typography>
                    <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress variant="determinate" value={(10 - countdown) * 10} />
                    </Box>
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                        {countdown}s
                    </Typography> */}
                </Paper>
            </Box>
        </Box>
    );
};

export default PaymentConfirmationPage;
