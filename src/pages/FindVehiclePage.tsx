import { useState } from 'react';
import { Box, Typography, Button, Stack, FormControl, InputLabel, Select, MenuItem, Paper, IconButton } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Define the type for a vehicle object
interface Vehicle {
  id: number;
  position: string;
}

// Hard-coded vehicle data. Set to [] to test the "No vehicles saved" feature.
const savedVehicles: Vehicle[] = [
    {
        id: 1,
        position: 'Hầm B3. Cột L8'
    }
];

const FindVehiclePage = () => {
    const navigate = useNavigate();
    const [basement, setBasement] = useState('');
    const [colLetter, setColLetter] = useState('');
    const [colNumber, setColNumber] = useState('');

    // --- Component for when NO vehicle is saved ---
    const renderNoVehicleFound = () => {
        const basements = ["B3", "B4", "B5", "B6"];
        const colLetters = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i)); // A-L
        const colNumbers = Array.from({ length: 9 }, (_, i) => i + 1); // 1-9

        return (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Bạn hiện không có xe nào được lưu
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
                    Hãy nhập vị trí xe của bạn để tìm kiếm
                </Typography>
                
                <Stack spacing={2} alignItems="center" component="form" sx={{ width: '100%', maxWidth: '350px' }}>
                    <FormControl fullWidth required>
                        <InputLabel id="basement-select-label">Tầng hầm</InputLabel>
                        <Select labelId="basement-select-label" value={basement} label="Tầng hầm" onChange={(e: SelectChangeEvent) => setBasement(e.target.value)}>
                            {basements.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <FormControl fullWidth required>
                            <InputLabel id="col-letter-select-label">Cột (chữ)</InputLabel>
                            <Select labelId="col-letter-select-label" value={colLetter} label="Cột (chữ)" onChange={(e: SelectChangeEvent) => setColLetter(e.target.value)}>
                                {colLetters.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel id="col-number-select-label">Cột (số)</InputLabel>
                            <Select labelId="col-number-select-label" value={colNumber} label="Cột (số)" onChange={(e: SelectChangeEvent) => setColNumber(e.target.value)}>
                                {colNumbers.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<LocationOnIcon />}
                        component={RouterLink}
                        to="/parking/find-vehicle/navigate"
                        disabled={!basement || !colLetter || !colNumber}
                        fullWidth
                        size="large"
                        sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            backgroundColor: '#E53935',
                            '&:hover': { backgroundColor: '#C62828' }
                        }}
                    >
                        Bắt đầu tìm xe
                    </Button>
                </Stack>
            </Box>
        );
    };

    // --- Component for when a vehicle IS found ---
    const renderVehicleFound = () => {
        const vehicle = savedVehicles[0];
        const basementText = vehicle.position.split('.')[0].toUpperCase();

        return (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 3, 
                        borderRadius: '16px', 
                        width: '100%', 
                        maxWidth: '400px', 
                        textAlign: 'center',
                        bgcolor: 'transparent' // Set background to transparent
                    }}
                >
                    <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                        Vị trí xe của bạn
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        {vehicle.position}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<LocationOnIcon />}
                        component={RouterLink}
                        to="/parking/find-vehicle/navigate"
                        fullWidth
                        size="large"
                        sx={{
                            py: 1,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            width: '80%',
                            borderRadius: '50px',
                            backgroundColor: '#E53935',
                            '&:hover': { backgroundColor: '#C62828' }
                        }}
                    >
                        Bắt đầu tìm xe
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2, display: 'block' }}>
                        (Nếu bạn đã đến <strong>{basementText}</strong>, hãy bấm vào nút trên)
                    </Typography>
                </Paper>
            </Box>
        );
    };

    return (
        <Box sx={{ bgcolor: '#f7f7f7', minHeight: '100vh' }}>
            {/* --- Header --- */}
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Tìm xe
                    </Typography>
                </Box>
            </Paper>

            {/* --- Conditional Content --- */}
            {savedVehicles.length > 0 ? renderVehicleFound() : renderNoVehicleFound()}
        </Box>
    );
};

export default FindVehiclePage;
