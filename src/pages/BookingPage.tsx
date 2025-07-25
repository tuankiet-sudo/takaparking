import { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, Paper, IconButton, Button, Stack,
    FormControl, InputLabel, Select, MenuItem, Modal, Fade, Snackbar, CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import dayjs, { Dayjs } from 'dayjs';

const MAX_BOOKABLE_SLOTS = 4;
const API_BASE_URL = 'https://takaparking-be.vercel.app';

interface ParkingSlot {
    id: number;
    column_id: string;
    slot_number: number;
    status: 'available' | 'occupied' | 'booked';
    booking_time: string | null;
}

const LegendItem = ({ color, text }: { color: string; text: string; }) => (
    <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 16, height: 16, bgcolor: color, borderRadius: '4px', border: '1px solid #ddd' }} />
        <Typography variant="body2">{text}</Typography>
    </Stack>
);

const BookingPage = () => {
    const navigate = useNavigate();
    const { vehicleType } = useParams<{ vehicleType: 'motorbike' | 'car' }>();

    const [allSlots, setAllSlots] = useState<ParkingSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedHour, setSelectedHour] = useState<string>(dayjs().format('HH'));
    const [selectedMinute, setSelectedMinute] = useState<string>(String(Math.ceil(dayjs().minute() / 5) * 5).padStart(2, '0'));
    const [selectedColumn, setSelectedColumn] = useState<string>('');
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [warningSlotInfo, setWarningSlotInfo] = useState<{ id: string; bookedTime: string } | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // --- NEW: State for vehicle options ---
    const [isElectric, setIsElectric] = useState<'gas' | 'electric'>('gas');
    const [willCharge, setWillCharge] = useState<'yes' | 'no'>('no');

    const now = dayjs();

    // --- MODIFIED: Dynamic column logic based on vehicle type and options ---
    const columns = useMemo(() => {
        if (vehicleType === 'motorbike') {
            if (isElectric === 'electric' && willCharge === 'yes') {
                return ['E9', 'F9'];
            }
            return Array.from({ length: 6 }, (_, i) => `${String.fromCharCode(71 + i)}9`); // G9 to L9
        }
        if (vehicleType === 'car') {
            if (isElectric === 'electric' && willCharge === 'yes') {
                return ['E1', 'F1', 'G1', 'H1'];
            }
            return ['E2', 'E3', 'E4', 'F2', 'F3', 'F4', 'G2', 'G3', 'G4', 'H2', 'H3', 'H4'];
        }
        return []; // Default empty
    }, [vehicleType, isElectric, willCharge]);

    // --- NEW: Dynamic slots count based on vehicle type ---
    const slotsToDisplay = useMemo(() => {
        const count = vehicleType === 'car' ? 5 : 20;
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [vehicleType]);
    
    // --- NEW: Effect to reset charging need if vehicle type is changed to gas ---
    useEffect(() => {
        if (isElectric === 'gas') {
            setWillCharge('no');
        }
    }, [isElectric]);

    // --- NEW: Effect to reset selected column if it's not in the available list ---
    useEffect(() => {
        if (columns.length > 0 && !columns.includes(selectedColumn)) {
            setSelectedColumn(columns[0]);
        }
    }, [columns, selectedColumn]);


    // --- MODIFIED: Dynamic Time Options ---
    const availableHours = useMemo(() => {
        const allHours = Array.from({ length: 14 }, (_, i) => String(9 + i).padStart(2, '0'));
        if (selectedDate?.isSame(now, 'day')) {
            return allHours.filter(h => parseInt(h) >= now.hour());
        }
        return allHours;
    }, [selectedDate, now]);

    const availableMinutes = useMemo(() => {
        const allMinutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
        if (selectedDate?.isSame(now, 'day') && selectedHour === now.format('HH')) {
            const currentMinute = now.minute();
            return allMinutes.filter(m => parseInt(m) >= currentMinute);
        }
        return allMinutes;
    }, [selectedDate, selectedHour, now]);

    // Effect to reset time if it becomes invalid
    useEffect(() => {
        if (availableHours.length > 0 && !availableHours.includes(selectedHour)) {
            setSelectedHour(availableHours[0]);
        }
    }, [availableHours, selectedHour]);

    useEffect(() => {
        if (availableMinutes.length > 0 && !availableMinutes.includes(selectedMinute)) {
            setSelectedMinute(availableMinutes[0]);
        }
    }, [availableMinutes, selectedMinute]);


    const userSelectedTime = useMemo(() => {
        if (!selectedDate) return null;
        return selectedDate.hour(parseInt(selectedHour)).minute(parseInt(selectedMinute));
    }, [selectedDate, selectedHour, selectedMinute]);

    useEffect(() => {
        if (!userSelectedTime) return;
        const fetchSlots = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/slots?time=${userSelectedTime.toISOString()}`);
                if (!response.ok) throw new Error('Failed to fetch slot data from server');
                const data: ParkingSlot[] = await response.json();
                setAllSlots(data);
            } catch (error) {
                console.error(error);
                setSnackbarMessage('Lỗi khi tải dữ liệu chỗ trống.');
                setSnackbarOpen(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSlots();
    }, [userSelectedTime]);

    const getSlotFromState = (column: string, slotNumber: number) => {
        return allSlots.find(s => s.column_id === column && s.slot_number === slotNumber);
    };

    const getSlotStatus = (column: string, slotNumber: number) => {
        const slot = getSlotFromState(column, slotNumber);
        if (!slot || !userSelectedTime) return 'available';

        if (slot.status === 'occupied' || slot.status === 'booked') {
            const bookedTime = dayjs(slot.booking_time);

            if (!userSelectedTime.isSame(bookedTime, 'day')) {
                return 'available';
            }

            const minutesDifference = bookedTime.diff(userSelectedTime, 'minute');

            if (userSelectedTime.isAfter(bookedTime)) return 'booked_before';
            if (minutesDifference <= 90 && minutesDifference >= 0) return 'booked_before';
            if (minutesDifference > 90) return 'booked_after';
        }
        
        return 'available';
    };

    const handleSlotClick = (column: string, slotNumber: number) => {
        const slotId = `${column}-${slotNumber}`;
        if (selectedSlots.includes(slotId)) {
            setSelectedSlots(prev => prev.filter(id => id !== slotId));
            return;
        }
        if (selectedSlots.length >= MAX_BOOKABLE_SLOTS) {
            setSnackbarMessage(`Bạn chỉ có thể đặt tối đa ${MAX_BOOKABLE_SLOTS} chỗ.`);
            setSnackbarOpen(true);
            return;
        }
        const status = getSlotStatus(column, slotNumber);
        if (status === 'available') {
            setSelectedSlots(prev => [...prev, slotId]);
        } else if (status === 'booked_after') {
            const slot = getSlotFromState(column, slotNumber);
            if (slot && slot.booking_time) {
                setWarningSlotInfo({ id: slotId, bookedTime: dayjs(slot.booking_time).format('HH:mm') });
                setWarningModalOpen(true);
            }
        }
    };
    
    const handleConfirmYellowSlot = () => {
        if (selectedSlots.length >= MAX_BOOKABLE_SLOTS) {
            setSnackbarMessage(`Bạn chỉ có thể đặt tối đa ${MAX_BOOKABLE_SLOTS} chỗ.`);
            setSnackbarOpen(true);
            handleCancelYellowSlot();
            return;
        }
        if (warningSlotInfo) {
            setSelectedSlots(prev => [...prev, warningSlotInfo.id]);
        }
        handleCancelYellowSlot();
    };

    const handleCancelYellowSlot = () => {
        setWarningModalOpen(false);
        setWarningSlotInfo(null);
    };
    
    const handleBooking = async () => {
        if (selectedSlots.length === 0 || !userSelectedTime) {
            alert('Vui lòng chọn chỗ và thời gian.');
            return;
        }
        const payload = selectedSlots.map(slotId => {
            const [column_id, slot_number_str] = slotId.split('-');
            const slot = getSlotFromState(column_id, parseInt(slot_number_str));
            if (!slot) throw new Error(`Could not find slot data for ${slotId}`);
            return {
                slot_id: slot.id,
                status: 'booked' as const,
                start_time: userSelectedTime.toISOString(),
            };
        });
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Lỗi khi tạo đặt chỗ.');
            }
            navigate('/parking/book-slot/success', {
                state: {
                    bookedSlots: selectedSlots,
                    bookingDateTime: userSelectedTime.toISOString(),
                    vehicleType: vehicleType,
                    isElectric: isElectric,
                    willCharge: willCharge
                }
            });
        } catch (error: any) {
            console.error("Booking failed:", error);
            setSnackbarMessage(error.message || 'Đặt chỗ thất bại. Vui lòng thử lại.');
            setSnackbarOpen(true);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ bgcolor: '#f7f7f7', minHeight: '100vh', pb: 4 }}>
                <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                    <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                            Đặt chỗ
                        </Typography>
                    </Box>
                </Paper>
                <Box sx={{ p: 2 }}>
                    {isLoading ? (
                        <Stack alignItems="center" mt={4}><CircularProgress /><Typography sx={{ mt: 2 }}>Đang tải dữ liệu chỗ trống...</Typography></Stack>
                    ) : (
                        <>
                            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                                Vui lòng chọn thời gian và vị trí bạn muốn đặt tại hầm B3 - Takashimaya
                            </Typography>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Thời gian</Typography>
                                <Stack spacing={2}>
                                    <DatePicker 
                                        label="Ngày muốn đặt" 
                                        value={selectedDate} 
                                        onChange={(date) => setSelectedDate(date)}
                                        minDate={dayjs()}
                                    />
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Giờ đến</Typography>
                                        <Stack direction="row" spacing={2}>
                                            <FormControl fullWidth>
                                                <InputLabel>Giờ</InputLabel>
                                                <Select value={selectedHour} label="Giờ" onChange={(e) => setSelectedHour(e.target.value)}>
                                                    {availableHours.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                            <FormControl fullWidth>
                                                <InputLabel>Phút</InputLabel>
                                                <Select value={selectedMinute} label="Phút" onChange={(e) => setSelectedMinute(e.target.value)}>
                                                    {availableMinutes.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Vị trí</Typography>

                                {/* --- NEW: Conditional controls for vehicle type --- */}
                                {(vehicleType === 'motorbike' || vehicleType === 'car') && (
                                     <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Loại xe</InputLabel>
                                            <Select value={isElectric} label="Loại xe" onChange={(e) => setIsElectric(e.target.value as 'gas' | 'electric')}>
                                                <MenuItem value="gas">Xe xăng</MenuItem>
                                                <MenuItem value="electric">Xe điện</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth>
                                            <InputLabel>Nhu cầu sạc điện</InputLabel>
                                            <Select value={willCharge} label="Nhu cầu sạc điện" onChange={(e) => setWillCharge(e.target.value as 'yes' | 'no')} disabled={isElectric === 'gas'}>
                                                <MenuItem value="no">Không</MenuItem>
                                                <MenuItem value="yes">Có</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth>
                                            <InputLabel>Cột</InputLabel>
                                            <Select value={selectedColumn} label="Cột" onChange={(e) => setSelectedColumn(e.target.value)}>
                                                {columns.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                )}
                               
                                <Stack direction="column" alignItems={'center'} spacing={2}>
                                    
                                    <Box sx={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 1, width: '100%' }}>
                                        {/* --- MODIFIED: Use dynamic slotsToDisplay --- */}
                                        {slotsToDisplay.map(slotNumber => {
                                            const status = getSlotStatus(selectedColumn, slotNumber);
                                            const isSelected = selectedSlots.includes(`${selectedColumn}-${slotNumber}`);
                                            const colors: { [key: string]: string } = { available: '#66BB6A', booked_before: '#E53935', booked_after: '#FFA726' };
                                            return (<Button key={slotNumber} variant="contained" onClick={() => handleSlotClick(selectedColumn, slotNumber)}
                                                sx={{ minWidth: 0, p: 0, height: 40, bgcolor: colors[status], color: 'white', border: isSelected ? '3px solid #1976D2' : 'none', '&:hover': { bgcolor: colors[status], opacity: 0.9 }, cursor: status === 'booked_before' ? 'not-allowed' : 'pointer' }}
                                            >{slotNumber}</Button>);
                                        })}
                                    </Box>
                                </Stack>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mb: 3 }}>
                                <Stack direction="column" spacing={2} justifyContent="center" flexWrap="wrap">
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Chú thích</Typography>
                                    <LegendItem color="#66BB6A" text="Bạn có thể đặt thoải mái và không bị giới hạn thời gian" />
                                    <LegendItem color="#FFA726" text="Bạn có thể đặt thoải mái nhưng bị giới hạn thời gian do có người đặt sau đó" />
                                    <LegendItem color="#E53935" text="Bạn không thể đặt do có người đã đặt gần khung giờ của bạn" />
                                </Stack>
                            </Paper>
                            <Button variant="contained" size="large" fullWidth onClick={handleBooking} disabled={selectedSlots.length === 0} sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '12px', backgroundColor: '#E53935', '&:hover': { backgroundColor: '#C62828' } }}>
                                Đặt chỗ ({selectedSlots.length})
                            </Button>
                        </>
                    )}
                </Box>
                <Modal open={warningModalOpen} onClose={handleCancelYellowSlot} closeAfterTransition sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Fade in={warningModalOpen}><Paper sx={{ p: 3, borderRadius: '16px', textAlign: 'center', maxWidth: '90%', width: '400px' }}><WarningAmberIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} /><Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Chú ý</Typography><Typography sx={{ color: 'text.secondary', mb: 3, textAlign: 'left' }}>Vị trí này đã được đặt trước vào lúc <strong>{warningSlotInfo?.bookedTime}</strong>, bạn cần lấy xe trước khung giờ đó.<br/><br/>Hãy nhấn <strong>xác nhận</strong> nếu bạn đồng ý.<br/><br/><Typography component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>Trường hợp không tuân thủ, xe của bạn sẽ được dời ra khỏi vị trí booking và phí phạt là 100.000 VNĐ.</Typography></Typography><Stack direction="row" spacing={2}><Button variant="outlined" fullWidth onClick={handleCancelYellowSlot}>Hủy</Button><Button variant="contained" fullWidth onClick={handleConfirmYellowSlot} sx={{ backgroundColor: '#E53935', '&:hover': { backgroundColor: '#C62828' } }}>Xác nhận</Button></Stack></Paper></Fade>
                </Modal>
                <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
            </Box>
        </LocalizationProvider>
    );
};

export default BookingPage;