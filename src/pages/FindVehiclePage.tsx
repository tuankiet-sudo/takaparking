import { useState } from 'react';
import { Box, Typography, Modal, Button, Stack, Card, CardActionArea, CardMedia, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';

// Hard-coded vehicle data
const savedVehicles = [
    {
        id: 1,
        signNumber: "59-L3 44559",
        position: "Hầm B3. Cột H3",
        imageUrl: "/vehicle.jpg" // Placeholder image
    }
];

// Style for the modal
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 320,
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
};

const FindVehiclePage = () => {
    const [open, setOpen] = useState(false);
    
    // Get current time formatted for Vietnam
    const currentTime = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // For now, we only have one vehicle, so we'll reference it directly
    const vehicle = savedVehicles[0];

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                Tìm xe
            </Typography>
            <Typography sx={{ mb: 2, textAlign: 'center' }}>
                Bấm vào thẻ bên dưới để chọn xe bạn muốn tìm.
            </Typography>

            {/* Vehicle List */}
            <Card sx={{ borderRadius: '16px' }} onClick={handleOpen}>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        height="140"
                        image={vehicle.imageUrl}
                        alt="Vehicle Image"
                    />
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TwoWheelerIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {vehicle.signNumber}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body1" color="text.secondary">
                                {vehicle.position}
                            </Typography>
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>

            {/* The Modal that pops up */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="find-vehicle-modal-title"
            >
                <Box sx={modalStyle}>
                    <Stack spacing={2} alignItems="center">
                        <Typography id="find-vehicle-modal-title" variant="h6" sx={{ fontWeight: 'bold' }}>
                            Takashimaya {currentTime}
                        </Typography>
                        <Typography>
                            Vị trí xe: {vehicle.position}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<LocationOnIcon />}
                            component={RouterLink}
                            to="/parking/find-vehicle/navigate" // The next page
                            onClick={handleClose}
                        >
                            Bắt đầu tìm xe
                        </Button>
                        <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            (Nếu bạn ĐÃ ĐẾN HẦM B3,
                            <br/>
                            Hãy bấm vào nút trên để bắt đầu tìm xe)
                        </Typography>
                    </Stack>
                </Box>
            </Modal>
        </Box>
    );
};

export default FindVehiclePage;
