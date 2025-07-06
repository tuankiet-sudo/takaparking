import { Box, Typography, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const FindSlotPage = () => {
    // Array to hold the basement levels for easy mapping
    const basements = ["B3", "B4", "B5", "B6"];

    return (
        <Box
            sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 120px)', // Adjust height to fill viewport minus header/footer
                textAlign: 'center',
            }}
        >
            <Typography 
                variant="h5" 
                sx={{ fontWeight: 'bold', mb: 4 }}
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
                        size="large"
                        // The link will navigate to a path specific to the chosen basement
                        component={RouterLink}
                        to={`/parking/find-slot/${level.toLowerCase()}`}
                        sx={{
                            py: 2, // Use padding to control button height
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
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