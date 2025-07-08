// import React from 'react';
import { Box, Typography, Paper, IconButton, Button, Stack, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// --- MOCK DATA for the booking confirmation ---
const bookingConfirmationData = {
  bookingCode: 'TKS-8A3D9B',
  bookingDate: '08/07/2025',
  bookingTime: '19:00',
  details: [
    {
      column: 'E9',
      slots: [5, 6],
      qrCodeUrl: 'https://placehold.co/200x200/ffffff/000000?text=QR+E9'
    },
    {
      column: 'G9',
      slots: [11],
      qrCodeUrl: 'https://placehold.co/200x200/ffffff/000000?text=QR+G9'
    },
    {
      column: 'L9',
      slots: [2],
      qrCodeUrl: 'https://placehold.co/200x200/ffffff/000000?text=QR+L9'
    }
  ]
};

// --- Helper component for downloading QR codes ---
const handleDownload = async (qrCodeUrl: string, fileName: string) => {
    try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading the image:', error);
        alert('Lỗi khi tải ảnh');
    }
};

const BookingConfirmationPage = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ bgcolor: '#f7f7f7', minHeight: '100vh', pb: 4 }}>
            {/* --- Header --- */}
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate('/parking')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Booking
                    </Typography>
                </Box>
            </Paper>

            {/* --- Main Content --- */}
            <Box sx={{ p: 2 }}>
                {/* --- Success Title --- */}
                <Stack alignItems="center" sx={{ mb: 2 }}>
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 1 }}/>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Bạn đã đặt chỗ thành công
                    </Typography>
                </Stack>

                {/* --- General Booking Info --- */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Thông tin chung</Typography>
                    <Stack divider={<Divider flexItem />} spacing={1}>
                        <InfoRow label="Mã đặt chỗ" value={bookingConfirmationData.bookingCode} />
                        <InfoRow label="Ngày đặt" value={bookingConfirmationData.bookingDate} />
                        <InfoRow label="Giờ đặt" value={bookingConfirmationData.bookingTime} />
                    </Stack>
                </Paper>

                {/* --- Detailed Booking Info per Column --- */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, mt: 3 }}>Chi tiết đặt chỗ</Typography>
                {bookingConfirmationData.details.map((detail, index) => (
                    <Paper key={index} elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
                        <Stack divider={<Divider flexItem />} spacing={1.5}>
                            <InfoRow label="Tầng hầm" value="B3" />
                            <InfoRow label="Cột" value={detail.column} />
                            <InfoRow label="Vị trí đã đặt" value={detail.slots.join(', ')} />
                        </Stack>
                        <Stack spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                             <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                                <img src={detail.qrCodeUrl} alt={`QR Code for column ${detail.column}`} style={{ width: '150px', height: '150px', display: 'block' }} />
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownload(detail.qrCodeUrl, `QRCode-Col-${detail.column}.png`)}
                                sx={{ color: 'text.secondary', borderColor: 'rgba(0, 0, 0, 0.23)'}}
                            >
                                Lưu mã QR
                            </Button>
                        </Stack>
                    </Paper>
                ))}

                {/* --- Important Notes --- */}
                <Typography sx={{ fontStyle: 'italic', color: 'error.main', mt: 3, textAlign: 'center' }}>
                    Lưu ý: Chỗ của bạn sẽ được giữ trong 15 phút kể từ {bookingConfirmationData.bookingTime}. Sau thời gian trên, hệ thống sẽ tự động hủy chỗ. Vui lòng đến đúng giờ và đậu xe đúng vị trí đã đặt trên hệ thống.
                </Typography>

                <Typography sx={{ color: 'text.secondary', mt: 2, textAlign: 'center', fontSize: '0.9rem' }}>
                    Vị trí xe của bạn đã được tự động lưu trên hệ thống. Sau khi mua sắm, vui lòng mở ứng dụng và chọn chức năng "Tìm xe" để được chỉ dẫn đến xe trong bãi.
                </Typography>
            </Box>
        </Box>
    );
};

// Helper component for info rows
const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
);

export default BookingConfirmationPage;
