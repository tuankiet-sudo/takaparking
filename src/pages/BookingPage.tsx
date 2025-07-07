import { useState, useMemo } from 'react';
import {
    Box, Typography, Paper, IconButton, Button, Stack,
    FormControl, InputLabel, Select, MenuItem, Modal, Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import dayjs, { Dayjs } from 'dayjs';

// --- MOCK DATA: Simulates slots that are already booked ---
const mockBookedSlots: { [key: string]: { slot: number; time: string }[] } = {
    'A9': [{ slot: 3, time: '14:00' }, { slot: 15, time: '18:00' }],
    'C9': [{ slot: 8, time: '10:00' }, { slot: 9, time: '10:00' }, { slot: 19, time: '21:00' }],
    'L9': [{ slot: 1, time: '11:00' }],
};

// --- Helper Components ---
const LegendItem = ({ color, text }: { color: string; text: string; }) => (
    <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 16, height: 16, bgcolor: color, borderRadius: '4px', border: '1px solid #ddd' }} />
        <Typography variant="body2">{text}</Typography>
    </Stack>
);

const BookingPage = () => {
    const navigate = useNavigate();
    
    // --- State Management ---
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedHour, setSelectedHour] = useState<string>('09');
    const [selectedMinute, setSelectedMinute] = useState<string>('00');
    const [selectedColumn, setSelectedColumn] = useState<string>('A9');
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [bookingSuccessModalOpen, setBookingSuccessModalOpen] = useState(false);

    // --- Data for Selectors ---
    const hours = Array.from({ length: 14 }, (_, i) => String(9 + i).padStart(2, '0')); // 09 to 22
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 00, 05, ..., 55
    const columns = Array.from({ length: 12 }, (_, i) => `${String.fromCharCode(65 + i)}9`); // A9 to L9

    // --- Memoized value for the user's selected time ---
    const selectedDateTime = useMemo(() => {
        return selectedDate ? `${selectedHour}:${selectedMinute}` : '24:00';
    }, [selectedDate, selectedHour, selectedMinute]);

    // --- Logic for Slot Status & Selection ---
    const getSlotStatus = (column: string, slotNumber: number) => {
        const bookings = mockBookedSlots[column] || [];
        const booking = bookings.find(b => b.slot === slotNumber);
        if (!booking) return 'available'; // Green
        if (booking.time < selectedDateTime) return 'booked_before'; // Red
        return 'booked_after'; // Yellow
    };

    const handleSlotClick = (column: string, slotNumber: number) => {
        const status = getSlotStatus(column, slotNumber);
        if (status !== 'available') return; // Can only select available slots

        const slotId = `${column}-${slotNumber}`;
        setSelectedSlots(prev =>
            prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
        );
    };
    
    // --- Booking Confirmation ---
    const handleBooking = () => {
        if (selectedSlots.length > 0) {
            setBookingSuccessModalOpen(true);
        } else {
            alert('Vui lòng chọn ít nhất một chỗ để đặt.');
        }
    };
    
    const handleCloseSuccessModal = () => {
        setBookingSuccessModalOpen(false);
        navigate('/'); // Navigate home after booking
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ bgcolor: '#f7f7f7', minHeight: '100vh', pb: 4 }}>
                {/* --- Header --- */}
                <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                    <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                            Booking
                        </Typography>
                    </Box>
                </Paper>

                {/* --- Main Content --- */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                        Vui lòng chọn thời gian và vị trí bạn muốn đặt tại hầm B3 - Takashimaya
                    </Typography>

                    {/* --- Time Section --- */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Thời gian</Typography>
                        <Stack spacing={2}>
                            <DatePicker label="Ngày muốn đặt" value={selectedDate} onChange={(date) => setSelectedDate(date)} />
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>Giờ đến</Typography>
                                <Stack direction="row" spacing={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Giờ</InputLabel>
                                        <Select value={selectedHour} label="Giờ" onChange={(e) => setSelectedHour(e.target.value)}>
                                            {hours.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Phút</InputLabel>
                                        <Select value={selectedMinute} label="Phút" onChange={(e) => setSelectedMinute(e.target.value)}>
                                            {minutes.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* --- Place Section --- */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Vị trí</Typography>
                        <Stack direction="row" spacing={2}>
                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>Cột</InputLabel>
                                <Select value={selectedColumn} label="Cột" onChange={(e) => setSelectedColumn(e.target.value)}>
                                    {columns.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>
                            {/* Slot Map: 2 rows x 10 columns = 20 slots */}
                            <Box sx={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 1 }}>
                                {Array.from({ length: 20 }, (_, i) => i + 1).map(slotNumber => {
                                    const status = getSlotStatus(selectedColumn, slotNumber);
                                    const isSelected = selectedSlots.includes(`${selectedColumn}-${slotNumber}`);
                                    const colors = {
                                        available: '#66BB6A',
                                        booked_before: '#E53935',
                                        booked_after: '#FFA726',
                                    };

                                    return (
                                        <Button
                                            key={slotNumber}
                                            variant="contained"
                                            onClick={() => handleSlotClick(selectedColumn, slotNumber)}
                                            sx={{
                                                minWidth: 0, p: 0, height: 40,
                                                bgcolor: colors[status],
                                                color: 'white',
                                                border: isSelected ? '3px solid #1976D2' : 'none',
                                                '&:hover': { bgcolor: colors[status], opacity: 0.9 },
                                                cursor: status !== 'available' ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {slotNumber}
                                        </Button>
                                    );
                                })}
                            </Box>
                        </Stack>
                    </Paper>

                    {/* --- Legend Section --- */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 3 }}>
                        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                            <LegendItem color="#66BB6A" text="Còn trống" />
                            <LegendItem color="#FFA726" text="Đã đặt (sau giờ bạn chọn)" />
                            <LegendItem color="#E53935" text="Đã đặt (trước giờ bạn chọn)" />
                        </Stack>
                    </Paper>
                    
                    {/* --- Booking Button --- */}
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleBooking}
                        disabled={selectedSlots.length === 0}
                        sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '12px', backgroundColor: '#E53935', '&:hover': { backgroundColor: '#C62828' } }}
                    >
                        Đặt chỗ ({selectedSlots.length})
                    </Button>
                </Box>
                
                {/* --- Booking Success Modal --- */}
                <Modal open={bookingSuccessModalOpen} onClose={handleCloseSuccessModal} closeAfterTransition sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Fade in={bookingSuccessModalOpen}>
                        <Paper sx={{ p: 4, borderRadius: '16px', textAlign: 'center', maxWidth: '90%', width: '350px' }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Đặt chỗ thành công!</Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                                Cảm ơn bạn đã đặt chỗ. Vui lòng đến đúng giờ đã hẹn.
                            </Typography>
                            <Button variant="contained" fullWidth onClick={handleCloseSuccessModal} sx={{ backgroundColor: '#E53935', '&:hover': { backgroundColor: '#C62828' } }}>
                                Về trang chủ
                            </Button>
                        </Paper>
                    </Fade>
                </Modal>
            </Box>
        </LocalizationProvider>
    );
};

export default BookingPage;

