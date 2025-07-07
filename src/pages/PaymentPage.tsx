import  { useState } from 'react';
import { Box, Typography, Button, Stack, Paper, IconButton, Tooltip, Snackbar, Modal, Fade } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

// --- Data for the payment details ---
const paymentDetails = {
    bankName: 'Ngân hàng TMCP Quân đội',
    accountHolder: 'Takashimaya Việt Nam',
    accountNumber: 'MB123456789',
    transactionContent: 'Thanh toan gui xe'
};

const qrCodeUrl = "/qrcode.png";

const PaymentPage = () => {
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

    // --- Time and Amount Calculation ---
    const now = new Date();
    const parkedTime = new Date(now.getTime() - 3 * 60 * 60 * 1000 - 47 * 60 * 1000);
    const parkingFee = "5.000 VND";

    // Helper to format date and time
    const formatDateTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setSnackbarMessage(`Đã sao chép: ${text}`);
            setSnackbarOpen(true);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setSnackbarMessage('Lỗi khi sao chép');
            setSnackbarOpen(true);
        });
    };
    
    const handlePaymentConfirmation = () => {
        setPaymentSuccessModalOpen(true);
    };

    const handleCloseSuccessModalAndNavigate = () => {
        setPaymentSuccessModalOpen(false);
        navigate('/');
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'QRCode-ThanhToan.png';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setSnackbarMessage('Đã tải xuống mã QR');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error downloading the image:', error);
            setSnackbarMessage('Lỗi khi tải ảnh');
            setSnackbarOpen(true);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f7f7f7', minHeight: '100vh', pb: 4 }}>
            {/* --- Header --- */}
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Thanh toán
                    </Typography>
                </Box>
            </Paper>

            {/* --- Main Content --- */}
            <Box sx={{ p: 2 }}>
                {/* --- Parking Details Section --- */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 3 }}>
                    <Stack spacing={2}>
                        <DetailRow label="Thời gian vào" value={formatDateTime(parkedTime)} />
                        <DetailRow label="Thời gian ra" value={formatDateTime(now)} />
                        <DetailRow label="Thời gian gửi xe" value="3 giờ 47 phút" />
                        <DetailRow label="Số tiền" value={parkingFee} />
                    </Stack>
                </Paper>

                <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                    Sử dụng ứng dụng ngân hàng quét mã QR dưới đây để tiến hành chuyển khoản
                </Typography>

                {/* --- QR Code Section --- */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <img
                        src={qrCodeUrl}
                        alt="QR Code for payment"
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            height: 'auto',
                            border: '1px solid #e0e0e0',
                            borderRadius: '16px',
                            padding: '16px',
                            backgroundColor: 'white'
                        }}
                    />
                </Box>

                {/* --- Action Buttons (Zoom and Download) --- */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ZoomInIcon />}
                        onClick={() => setQrModalOpen(true)}
                        sx={{
                            color: 'text.secondary',
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                            '&:hover': {
                                borderColor: 'rgba(0, 0, 0, 0.5)',
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        Phóng to
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{
                            color: 'text.secondary',
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                            '&:hover': {
                                borderColor: 'rgba(0, 0, 0, 0.5)',
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        Tải xuống
                    </Button>
                </Stack>

                <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                    Hoặc nhập thủ công thông tin chuyển khoản bên dưới
                </Typography>

                {/* --- Bank Transfer Details Section --- */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: '16px' }}>
                    <Stack spacing={2.5}>
                        <DetailRow label="Ngân hàng thụ hưởng" value={paymentDetails.bankName} />
                        <DetailRow label="Người nhận" value={paymentDetails.accountHolder} />
                        <DetailRow label="Số tài khoản" value={paymentDetails.accountNumber} onCopy={() => handleCopy(paymentDetails.accountNumber)} />
                        <DetailRow label="Nội dung chuyển khoản" value={paymentDetails.transactionContent} onCopy={() => handleCopy(paymentDetails.transactionContent)} />
                    </Stack>
                </Paper>

                {/* --- Payment Button --- */}
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handlePaymentConfirmation}
                    sx={{
                        mt: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderRadius: '50px',
                        backgroundColor: '#E53935',
                        '&:hover': { backgroundColor: '#C62828' }
                    }}
                >
                    Đã thanh toán
                </Button>
            </Box>

            {/* --- Full-screen QR Code Modal --- */}
            <Modal
                open={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                closeAfterTransition
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Fade in={qrModalOpen}>
                    <Box sx={{ position: 'relative', outline: 'none' }}>
                        <IconButton
                            onClick={() => setQrModalOpen(false)}
                            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <img src={qrCodeUrl} alt="Full screen QR Code" style={{ maxHeight: '90vh', maxWidth: '90vw' }} />
                    </Box>
                </Fade>
            </Modal>

            {/* --- Payment Success Modal --- */}
            <Modal
                open={paymentSuccessModalOpen}
                onClose={handleCloseSuccessModalAndNavigate}
                closeAfterTransition
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Fade in={paymentSuccessModalOpen}>
                    <Paper sx={{ p: 4, borderRadius: '16px', textAlign: 'center', maxWidth: '90%', width: '350px' }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Thanh toán thành công
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleCloseSuccessModalAndNavigate}
                            sx={{ 
                                backgroundColor: '#E53935',
                                '&:hover': { backgroundColor: '#C62828' }
                            }}
                        >
                            Về trang chủ
                        </Button>
                    </Paper>
                </Fade>
            </Modal>

            {/* --- Snackbar for copy/download confirmation --- */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};

// Helper component for displaying a row of details
const DetailRow = ({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>{label}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{value}</Typography>
            {onCopy && (
                <Tooltip title="Sao chép">
                    <IconButton size="small" onClick={onCopy}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    </Box>
);

export default PaymentPage;
