import { Box, Typography, Button, Stack, Paper, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PreBookingPageEn = () => {
    const navigate = useNavigate();
    // Array to hold the basement vehicleTypes for easy mapping
    const vehicleTypes = ["Motorbike", "Car"];

    return (
        <Box sx={{ bgcolor: '#f7f7f7'}}>
            {/* --- Header --- */}
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Booking
                    </Typography>
                </Box>
            </Paper>

            {/* --- Main Content --- */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        mt: 2,
                        mb: 4,
                    }}
                >
                    The vehicle type you want to book a slot for:
                </Typography>
                <Stack
                    spacing={2.5}
                    sx={{ width: '100%', maxWidth: '350px', mx: 'auto', mb: 4 }}
                >
                    {vehicleTypes.map((vehicleType) => (
                        <Button
                            key={vehicleType}
                            variant="contained"
                            size="large"
                            component={RouterLink}
                            to={`/en/parking/book-slot/${'Motorbike' === vehicleType ? 'motorbike' : 'car'}`}
                            sx={{
                                py: 1,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                backgroundColor: '#E53935',
                                '&:hover': {
                                    backgroundColor: '#C62828'
                                }
                            }}
                        >
                            {vehicleType}
                        </Button>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
};

export default PreBookingPageEn;
