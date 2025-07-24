import { Box, Typography, Paper, IconButton, Button, Stack, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import dayjs from 'dayjs';

// Helper to process the selected slots into a structured format for display
const groupSlotsByColumn = (bookedSlots: string[]) => {
    if (!bookedSlots || bookedSlots.length === 0) return [];

    const grouped = bookedSlots.reduce((acc, slotId) => {
        const [column, slotNumber] = slotId.split('-');
        if (!acc[column]) {
            acc[column] = {
                column: column,
                slots: [],
                qrCodeUrl: `/${column}.png` // Assuming QR code images are named by column
            };
        }
        acc[column].slots.push(parseInt(slotNumber));
        return acc;
    }, {} as { [key: string]: { column: string; slots: number[]; qrCodeUrl: string } });

    return Object.values(grouped);
};

// Helper component for downloading QR codes
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
        alert('Error downloading the image');
    }
};

const BookingConfirmationPageEn = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- MODIFIED: Get detailed vehicle info from location.state ---
    const { bookedSlots, bookingDateTime, vehicleType, isElectric, willCharge } = location.state as {
        bookedSlots: string[];
        bookingDateTime: string;
        vehicleType: 'motorbike' | 'car';
        isElectric: 'gas' | 'electric';
        willCharge: 'yes' | 'no';
    } || { 
        bookedSlots: [], 
        bookingDateTime: new Date().toISOString(),
        vehicleType: 'car',
        isElectric: 'gas',
        willCharge: 'no'
    };

    // --- NEW: Function to create detailed vehicle display name ---
const getVehicleTypeDisplay = () => {
    if (vehicleType === 'motorbike') {
        return isElectric === 'electric' ? 'Electric motorbike' : 'Gas motorbike';
    }
    if (vehicleType === 'car') {
        return isElectric === 'electric' ? 'Electric car' : 'Gas car';
    }
    return 'Unknown';
};

    // Process the data for display
    const bookingConfirmationData = {
        bookingCode: `TKS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        bookingDate: dayjs(bookingDateTime).format('DD/MM/YYYY'),
        bookingTime: dayjs(bookingDateTime).format('HH:mm'),
        vehicleType: getVehicleTypeDisplay(),
        isElectric: isElectric,
        chargingNeed: willCharge === 'yes' ? 'Yes' : 'No',
        details: groupSlotsByColumn(bookedSlots)
    };

    return (
<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f7f7f7', minHeight: '100vh', pb: 4 }}>
    <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white', width: '100%' }}>
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <IconButton onClick={() => navigate('/en/parking')}><ArrowBackIcon /></IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                Booking
            </Typography>
        </Box>
    </Paper>
    <Box sx={{ p: 2 }}>
        <Stack alignItems="center" sx={{ mb: 2 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Your booking was successful
            </Typography>
        </Stack>
        <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>General Information</Typography>
            <Stack divider={<Divider flexItem />} spacing={1}>
                <InfoRow label="Booking Code" value={bookingConfirmationData.bookingCode} />
                <InfoRow label="Vehicle Type" value={bookingConfirmationData.vehicleType} />
                {bookingConfirmationData.isElectric === 'electric' && (
                    <InfoRow label="Charging Need" value={bookingConfirmationData.chargingNeed} />
                )}
                <InfoRow label="Date" value={bookingConfirmationData.bookingDate} />
                <InfoRow label="Time" value={bookingConfirmationData.bookingTime} />
            </Stack>
        </Paper>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, mt: 3 }}>Booking Details</Typography>
        {bookingConfirmationData.details.map((detail, index) => (
            <Paper key={index} elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
                <Stack divider={<Divider flexItem />} spacing={1.5}>
                    <InfoRow label="Basement" value="B3" />
                    <InfoRow label="Column" value={detail.column} />
                    <InfoRow label="Booked Slots" value={detail.slots.sort((a, b) => a - b).join(', ')} />
                </Stack>
                <Stack spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                    <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <img src={detail.qrCodeUrl} alt={`QR Code for column ${detail.column}`} style={{ width: '150px', height: '150px', display: 'block' }} />
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(detail.qrCodeUrl, `QRCode-Col-${detail.column}.png`)}
                        sx={{ color: 'text.secondary', borderColor: 'rgba(0, 0, 0, 0.23)' }}
                    >
                        Download QR Code
                    </Button>
                </Stack>
            </Paper>
        ))}
        <Typography sx={{ fontStyle: 'italic', color: 'error.main', mt: 3, textAlign: 'center' }}>
            Note: Your slot will be reserved for 30 minutes from {bookingConfirmationData.bookingTime}. After that, the system will automatically cancel the booking. Please arrive on time and park in the reserved spot.
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 2, textAlign: 'center', fontSize: '0.9rem' }}>
            Your parking location has been automatically saved in the system. After shopping, please open the app and select the "Find My Car" feature for guidance to your vehicle.
        </Typography>
    </Box>
    <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={() => navigate('/en/parking')}
        sx={{
            py: 1,
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '12px',
            backgroundColor: '#E53935',
            maxWidth: '200px',
            mt: 2,
            '&:hover': { backgroundColor: '#C62828' }
        }}
    >
        Done
    </Button>
</Box>
    );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
);

export default BookingConfirmationPageEn;
