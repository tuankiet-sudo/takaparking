import { useState } from 'react';
import { Box, Typography,  Grid, Modal, IconButton} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentIcon from '@mui/icons-material/Payment';
import SaveIcon from '@mui/icons-material/Save';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import type { JSX } from 'react/jsx-runtime';

const parkingOptions = [
  { name: 'LOCATION', icon: <LocationOnIcon sx={{ color: 'white', fontSize: 32 }} /> },
  { name: 'FIND A SLOT', icon: <SearchIcon sx={{ color: 'white', fontSize: 32 }} />, path: '/en/parking/find-slot' },
  { name: 'BOOKING', icon: <EventAvailableIcon sx={{ color: 'white', fontSize: 32 }} />, path: '/en/parking/book-slot' },
  { name: 'PAYMENT', icon: <PaymentIcon sx={{ color: 'white', fontSize: 32 }} />, path: '/en/parking/pay-fee' },
];

const viTriSubOptions = [
  { id: 'save-slot', name: 'SAVE LOCATION', icon: <SaveIcon sx={{ color: 'white', fontSize: 32 }} />, path: '/en/parking/save-slot' },
  { id: 'find-vehicle', name: 'FIND VEHICLE', icon: <FindInPageIcon sx={{ color: 'white', fontSize: 32 }} />, path: '/en/parking/find-vehicle' },
];

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper', // White background
  borderRadius: '16px',         // Rounded corners
  boxShadow: 24,
  p: 2, // Padding
  pt: 4, // More padding at the top to make space for the close button
};


const ParkingPageEn = () => {
    
    // State to control the modal's visibility
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // A reusable function to render a single styled grid item
  const renderGridItem = (item: {id: string, name: string, icon: JSX.Element, path?: string}, onClick?: () => void) => {
    const itemContent = (
      <Box 
        sx={{ textAlign: 'center', cursor: 'pointer' }}
        onClick={onClick}
      >
        <Box sx={{
            backgroundColor: '#E53935',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            aspectRatio: '1 / 1',
            mb: 1
        }}>
           {item.icon}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', lineHeight: '1.2' }}>
            {item.name}
        </Typography>
      </Box>
    );

    // If the item has a path, wrap it in a link
    if (item.path) {
        return (
            <RouterLink to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                {itemContent}
            </RouterLink>
        )
    }
    return itemContent;
  }


  return (
    <Box>
      <Typography 
        variant="h5" 
        sx={{ 
            fontWeight: 'bold', 
            padding: '16px 16px 0 16px',
        }}
      >
        Parking
      </Typography>
      <Box sx={{ padding: '16px' }}>
      <Grid container spacing={2}>
                {parkingOptions.map((cat) => {
                    // This is the content for each grid item
                    const itemContent = (
                        <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={cat.name === 'VEHICLE LOCATION' ? handleOpen : undefined}>
                            <Box sx={{
                                backgroundColor: '#E53935', // Red color
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                aspectRatio: '1 / 1', // Keep it square
                                mb: 1 // Margin bottom for spacing
                            }}>
                               {cat.icon}
                            </Box>
                            <Typography variant="caption" sx={{
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                lineHeight: '1.2'
                            }}>
                                {cat.name}
                            </Typography>
                        </Box>
                    );

                    return (
                        <Grid size={{xs: 3}} key={cat.name}>
                            {/* If a path exists, wrap the content in a link. Otherwise, just render the content. */}
                            {cat.path ? (
                                <RouterLink to={cat.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {itemContent}
                                </RouterLink>
                            ) : (
                                itemContent
                            )}
                        </Grid>
                    );
                })}
            </Grid>
        </Box>

          {/* Collapsible section for the sub-options */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parking-sub-options-title"
      >
        <Box sx={modalStyle}>
          {/* Close button positioned at the top right */}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Grid container spacing={2} justifyContent="center">
            {viTriSubOptions.map((subOpt) => (
              <Grid size={{xs: 4}} key={subOpt.id}>
                {renderGridItem(subOpt)}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
};

export default ParkingPageEn;
