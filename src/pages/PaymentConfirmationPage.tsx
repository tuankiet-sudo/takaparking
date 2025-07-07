// import React from 'react';
import { useState } from 'react';
import { Box, Typography, Paper, IconButton, Button, Stack, Divider, Modal, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Helper for detail rows
const DetailRow = ({ label, value, valueColor = 'text.primary' }: { label: string, value: string, valueColor?: string }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
        <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontWeight: 'bold', color: valueColor }}>{value}</Typography>
    </Box>
);

const PaymentConfirmationPage = () => {
    const navigate = useNavigate();
    // const { vehicleId } = useParams<{ vehicleId: string }>();
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    const handleOpenSuccessModal = () => {
        setSuccessModalOpen(true);
    };

    const handleCloseSuccessModal = () => {
        setSuccessModalOpen(false);
        navigate('/parking/find-vehicle'); // Redirect to the Find Vehicle page after closing the modal
    };

    // Hardcoded data for the demo
    const transaction = {
        id: '#2534003',
        imageUrl: '/vehicle.jpg', // Replace with actual image URL
        licensePlate: '59L3-44559',
        timeIn: '25/06/2025 20:43:35',
        location: 'Takashimaya',
        fee: '5,000 VND',
        duration: '0 giờ 35 phút',
        discount: '0 VND',
        total: '5,000 VND'
    };

    return (
        <Box sx={{ bgcolor: '#f7f7f7', minHeight: '100vh' }}>
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
            </Box>

            {/* --- Footer with Pay Button --- */}
            <Paper elevation={2} sx={{ position: 'sticky', bottom: 0, p: 2 }}>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => { handleOpenSuccessModal(); }}
                    sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        backgroundColor: '#E53935',
                        '&:hover': { backgroundColor: '#C62828' }
                    }}
                >
                    Thanh toán
                </Button>
            </Paper>

            <Modal
                open={successModalOpen}
                onClose={handleCloseSuccessModal}
                closeAfterTransition
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Fade in={successModalOpen}>
                    <Paper sx={{ p: 4, borderRadius: '16px', textAlign: 'center', maxWidth: '90%', width: '350px' }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Thanh toán thành công
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                            Cảm ơn quý khách đã sử dụng dịch vụ. Bạn có thể tìm xe của mình ngay bây giờ.
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleCloseSuccessModal}
                            sx={{ 
                                backgroundColor: '#E53935',
                                '&:hover': { backgroundColor: '#C62828' }
                            }}
                        >
                            Đến trang Tìm xe
                        </Button>
                    </Paper>
                </Fade>
            </Modal>
        </Box>
    );
};

export default PaymentConfirmationPage;
