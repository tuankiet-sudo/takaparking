import { Box, Typography, Button, Stack, Paper, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FindSlotPageEn = () => {
    const navigate = useNavigate();
    // Array to hold the basement levels for easy mapping
    const basements = ["B3", "B4", "B5", "B6"];

    return (
        <Box sx={{ bgcolor: '#f7f7f7'}}>
            {/* --- Header --- */}
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Find Empty Slots
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
                    PLEASE SELECT THE BASEMENT LEVEL WHERE YOU WANT TO PARK
                </Typography>
                <Stack
                    spacing={2.5}
                    sx={{ width: '100%', maxWidth: '350px', mx: 'auto', mb: 4 }}
                >
                    {basements.map((level) => (
                        <Button
                            key={level}
                            variant="contained"
                            size="large"
                            component={RouterLink}
                            to={`/en/parking/find-slot/map/${level.toLowerCase()}`}
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
                            BASEMENT {level}
                        </Button>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
};

export default FindSlotPageEn;
