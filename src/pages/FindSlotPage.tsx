import { Box, Typography, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const FindSlotPage = () => {
    // Array to hold the basement levels for easy mapping
    const basements = ["B3", "B4", "B5", "B6"];

    return (
        <Box
            sx={{
                p: 2, // Use consistent padding
                // The following properties center the content horizontally
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: 2 // Use consistent margin-bottom
                }}
            >
                HÃY CHỌN TẦNG HẦM BẠN MUỐN GỬI XE
            </Typography>
            <Stack
                spacing={2.5}
                sx={{ width: '100%', maxWidth: '350px' }}
            >
                {basements.map((level) => (
                    <Button
                        key={level}
                        variant="contained"
                        size="medium"
                        // The link will navigate to a path specific to the chosen basement
                        component={RouterLink}
                        to={`/parking/find-slot/${level.toLowerCase()}`}
                        sx={{
                            py: 1, // Use padding to control button height
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            backgroundColor: '#E53935', // Set the button color
                            '&:hover': {
                                backgroundColor: '#C62828' // Darken color on hover
                            }
                        }}
                    >
                        TẦNG HẦM {level}
                    </Button>
                ))}
            </Stack>
        </Box>
    );
};

export default FindSlotPage;