import { useState } from 'react';
import { Box, Typography, Button, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Define the type for a vehicle object
interface Vehicle {
  id: number;
  position: string;
}

// Hard-coded vehicle data with the explicit type Vehicle[]
// Set this to [] to test the "No vehicles saved" feature.
const savedVehicles: Vehicle[] = [
    {
        id: 1,
        position: 'Hầm B3. Cột L8'
    }
];


const FindVehiclePage = () => {
    // State for manual vehicle location input
    const [basement, setBasement] = useState('');
    const [colLetter, setColLetter] = useState('');
    const [colNumber, setColNumber] = useState('');

    // --- Component for when NO vehicle is saved ---
    const renderNoVehicleFound = () => {
        const basements = ["B3", "B4", "B5", "B6"];
        const colLetters = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i)); // A-L
        const colNumbers = Array.from({ length: 9 }, (_, i) => i + 1); // 1-9

        return (
            <Box sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
            }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' , mb: 1}}>
                    Tìm xe
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', }}>
                    Bạn hiện không có xe nào được lưu
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                    Hãy nhập vị trí xe của bạn để tìm kiếm
                </Typography>
                
                <Stack spacing={2} alignItems="center" component="form" sx={{ width: '100%', maxWidth: '350px' }}>
                    

                    <FormControl fullWidth required>
                        <InputLabel id="basement-select-label">Tầng hầm</InputLabel>
                        <Select
                            labelId="basement-select-label"
                            value={basement}
                            label="Tầng hầm"
                            onChange={(e: SelectChangeEvent) => setBasement(e.target.value)}
                        >
                            {basements.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <FormControl fullWidth required>
                            <InputLabel id="col-letter-select-label">Cột (chữ)</InputLabel>
                            <Select
                                labelId="col-letter-select-label"
                                value={colLetter}
                                label="Cột (chữ)"
                                onChange={(e: SelectChangeEvent) => setColLetter(e.target.value)}
                            >
                                {colLetters.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel id="col-number-select-label">Cột (số)</InputLabel>
                            <Select
                                labelId="col-number-select-label"
                                value={colNumber}
                                label="Cột (số)"
                                onChange={(e: SelectChangeEvent) => setColNumber(e.target.value)}
                            >
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
        const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const basementText = vehicle.position.split('.')[0].toUpperCase();

        return (
            <Box sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
         }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Tìm xe
                </Typography>
                <Typography id="find-vehicle-title" variant="h6" sx={{ fontWeight: 'bold' ,mb: 1 }}>
                    Takashimaya {currentTime}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                    Vị trí xe của bạn: <strong>{vehicle.position}</strong>
                </Typography>
                <Stack spacing={2} alignItems="center">
                    <Button
                        variant="contained"
                        startIcon={<LocationOnIcon />}
                        component={RouterLink}
                        to="/parking/find-vehicle/navigate"
                    >
                        Bắt đầu tìm xe
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                        (Nếu bạn đã đến <strong>{basementText}</strong>,
                        <br />
                        Hãy bấm vào nút trên để bắt đầu tìm xe)
                    </Typography>
                </Stack>
            </Box>
        );
    };

    return savedVehicles.length > 0 ? renderVehicleFound() : renderNoVehicleFound();
};

export default FindVehiclePage;