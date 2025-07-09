import { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, FormControl, InputLabel, Select, MenuItem, Paper, IconButton } from '@mui/material';
// import type { SelectChangeEvent } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FindVehiclePage = () => {
    const navigate = useNavigate();
    const [savedVehicle, setSavedVehicle] = useState<{ position: string } | null>(null);
    const [basement, setBasement] = useState('');
    const [colLetter, setColLetter] = useState('');
    const [colNumber, setColNumber] = useState('');

    // --- Check localStorage on component mount ---
    useEffect(() => {
        const storedVehicle = localStorage.getItem('savedVehicle');
        if (storedVehicle) {
            setSavedVehicle(JSON.parse(storedVehicle));
        }
    }, []);

    const handleManualSave = () => {
        if (basement && colLetter && colNumber) {
            const position = `Hầm ${basement}. Cột ${colLetter}${colNumber}`;
            const vehicleToSave = { position };
            localStorage.setItem('savedVehicle', JSON.stringify(vehicleToSave));
            setSavedVehicle(vehicleToSave); // Update state to re-render
        }
    };

    // --- Component for when NO vehicle is saved ---
    const renderNoVehicleFound = () => {
        const basements = ["B3", "B4", "B5", "B6"];
        const colLetters = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i)); // A-L
        const colNumbers = Array.from({ length: 9 }, (_, i) => i + 1); // 1-9

        return (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Bạn chưa lưu vị trí xe
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
                    Vui lòng nhập thủ công vị trí của bạn
                </Typography>
                
                <Stack spacing={2} alignItems="center" component="form" sx={{ width: '100%', maxWidth: '350px' }}>
                    <FormControl fullWidth required>
                        <InputLabel>Tầng hầm</InputLabel>
                        <Select value={basement} label="Tầng hầm" onChange={(e) => setBasement(e.target.value)}>
                            {basements.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <FormControl fullWidth required>
                            <InputLabel>Cột (chữ)</InputLabel>
                            <Select value={colLetter} label="Cột (chữ)" onChange={(e) => setColLetter(e.target.value)}>
                                {colLetters.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel>Cột (số)</InputLabel>
                            <Select value={colNumber} label="Cột (số)" onChange={(e) => setColNumber(e.target.value)}>
                                {colNumbers.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                    <Button
                        variant="contained"
                        onClick={handleManualSave}
                        disabled={!basement || !colLetter || !colNumber}
                        fullWidth size="large"
                        sx={{ py: 1, fontSize: '1rem', maxWidth: '200px', fontWeight: 'bold', borderRadius: '50px', backgroundColor: '#E53935', '&:hover': { backgroundColor: '#C62828' } }}
                    >
                        Tìm xe
                    </Button>
                </Stack>
            </Box>
        );
    };

    // --- Component for when a vehicle IS found ---
    const renderVehicleFound = () => {
        const basementText = savedVehicle?.position.split('.')[0].replace('Hầm ', '') || '';
        return (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', width: '100%', maxWidth: '400px', textAlign: 'center', bgcolor: 'transparent' }}>
                    <Typography sx={{ color: 'text.secondary', mb: 1 }}>Vị trí xe của bạn</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>{savedVehicle?.position}</Typography>
                    <Button
                        variant="contained" startIcon={<LocationOnIcon />} component={RouterLink}
                        to="/parking/find-vehicle/navigate" fullWidth size="large"
                        sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px', backgroundColor: '#E53935', '&:hover': { backgroundColor: '#C62828' } }}
                    >
                        Bắt đầu tìm xe
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2, display: 'block' }}>
                        (Nếu bạn đã đến <strong>Hầm {basementText}</strong>, hãy bấm vào nút trên)
                    </Typography>
                </Paper>
            </Box>
        );
    };

    return (
        <Box sx={{ bgcolor: '#f7f7f7', minHeight: '100vh' }}>
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Tìm xe
                    </Typography>
                </Box>
            </Paper>
            {savedVehicle ? renderVehicleFound() : renderNoVehicleFound()}
        </Box>
    );
};

export default FindVehiclePage;
