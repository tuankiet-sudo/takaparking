import { Box, Typography, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Hard-coded vehicle data
const savedVehicles = [
    {
        id: 1,
        signNumber: "59-L3 44559",
        position: "Hầm B3. Cột F8",
        imageUrl: "/vehicle.jpg" // Placeholder image
    }
];

const FindVehiclePage = () => {
    // Get current time formatted for Vietnam
    const currentTime = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // For now, we only have one vehicle, so we'll reference it directly
    const vehicle = savedVehicles[0];

    return (
        <Box sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
        }}>
            <Stack spacing={2} alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Tìm xe
                </Typography>
                <Typography id="find-vehicle-title" variant="h6" sx={{ fontWeight: 'bold' }}>
                    Takashimaya {currentTime}
                </Typography>
                <Typography>
                    Vị trí xe của bạn: <strong>{vehicle.position}</strong>
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<LocationOnIcon />}
                    component={RouterLink}
                    to="/parking/find-vehicle/navigate" // The next page
                >
                    Bắt đầu tìm xe
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                    (Nếu bạn ĐÃ ĐẾN HẦM B3,
                    <br/>
                    Hãy bấm vào nút trên để bắt đầu tìm xe)
                </Typography>
            </Stack>
        </Box>
    );
};

export default FindVehiclePage;