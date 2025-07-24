import { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, FormControl, InputLabel, Select, MenuItem, Paper, IconButton } from '@mui/material';
// import type { SelectChangeEvent } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FindVehiclePageEn = () => {
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
            const position = `Basement ${basement}. Column ${colLetter}${colNumber}`;
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
                    You haven't saved your vehicle location
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
                    Please enter your location manually
                </Typography>
                
                <Stack spacing={2} alignItems="center" component="form" sx={{ width: '100%', maxWidth: '350px' }}>
                    <FormControl fullWidth required>
                        <InputLabel>Basement</InputLabel>
                        <Select value={basement} label="Basement" onChange={(e) => setBasement(e.target.value)}>
                            {basements.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <FormControl fullWidth required>
                            <InputLabel>Column (character)</InputLabel>
                            <Select value={colLetter} label="Column (character)" onChange={(e) => setColLetter(e.target.value)}>
                                {colLetters.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel>Column (number)</InputLabel>
                            <Select value={colNumber} label="Column (number)" onChange={(e) => setColNumber(e.target.value)}>
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
                        Find My Vehicle
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
                    <Typography sx={{ color: 'text.secondary', mb: 1 }}>Your Vehicle Location</Typography>
<Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
  {(() => {
    if (!savedVehicle?.position) return '';
    
    let displayPosition = savedVehicle.position;

    if (displayPosition.includes('Hầm')) {
      displayPosition = displayPosition.replace('Hầm', 'Basement');
    }

    if (displayPosition.includes('Cột')) {
      displayPosition = displayPosition.replace('Cột', 'Column');
    }

    return displayPosition;
  })()}
</Typography>
                    <Button
                        variant="contained" startIcon={<LocationOnIcon />} component={RouterLink}
                        to="/en/parking/find-vehicle/navigate" fullWidth size="large"
                        sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px', backgroundColor: '#E53935', '&:hover': { backgroundColor: '#C62828' } }}
                    >
                        Start Navigation
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2, display: 'block' }}>
                        (If you have arrived at <strong>Basement {basementText}</strong>, please tap the button above)
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
                        Find Vehicle
                    </Typography>
                </Box>
            </Paper>
            {savedVehicle ? renderVehicleFound() : renderNoVehicleFound()}
        </Box>
    );
};

export default FindVehiclePageEn;
