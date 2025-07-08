import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Paper, IconButton } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReplayIcon from '@mui/icons-material/Replay';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import { useNavigate } from 'react-router-dom';

const SaveSlotPage = () => {
  const navigate = useNavigate();
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  
  const scannerRegionId = "html5qr-code-full-region";

  // --- Effect 1: Get available cameras on component mount ---
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer the back camera if available
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('sau'));
          setActiveCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setCameraError("Không tìm thấy camera nào trên thiết bị.");
        }
      })
      .catch(err => {
        console.error("Camera permission error:", err);
        setCameraError("Vui lòng cấp quyền truy cập camera để quét mã.");
      });
  }, []); // Run only once on mount

  // --- Effect 2: Manage the scanner lifecycle ---
  // This effect starts, stops, and restarts the scanner based on state changes.
  useEffect(() => {
    // Don't do anything if we're not supposed to be scanning or no camera is selected
    if (!isScanning || !activeCameraId) {
      return;
    }

    // Create a new instance every time to avoid state issues
    const html5QrCode = new Html5Qrcode(scannerRegionId, { verbose: false });

    const startScanner = () => {
        html5QrCode.start(
            activeCameraId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                setScannedResult(decodedText);
                setIsScanning(false); // This will trigger the cleanup
            },
            () => {} // Optional scan failure callback
        ).catch(err => {
            setCameraError("Không thể khởi động camera.");
            console.error("Error starting scanner:", err);
        });
    };

    startScanner();

    // --- CRITICAL: Cleanup function ---
    // This function runs whenever the component unmounts or the dependencies [isScanning, activeCameraId] change.
    // This is how we stop the old camera stream before starting a new one.
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => {
          console.error("Failed to stop scanner cleanly.", err);
        });
      }
    };
  }, [isScanning, activeCameraId]); // Re-run this effect when the scanning state or active camera changes

  const handleRescan = () => {
    setScannedResult(null);
    setCameraError(null);
    setIsScanning(true);
  };

  const handleFlipCamera = () => {
    if (cameras.length > 1 && activeCameraId) {
      const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      // Changing the active camera ID will trigger the useEffect hook above
      // to stop the old stream and start a new one.
      setActiveCameraId(cameras[nextIndex].id);
    }
  };

  return (
    <Box sx={{ padding: 2, textAlign: 'center' }}>
      <Paper elevation={1} sx={{ top: 0, zIndex: 10, bgcolor: 'white', mb: 2 }}>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
              <IconButton onClick={() => navigate(-1)}>
                  <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                Lưu vị trí xe
              </Typography>
          </Box>
      </Paper>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Hãy quét mã QR trên cột để lưu vị trí xe của bạn
      </Typography>

      {isScanning && (
        <Box sx={{ width: '100%', maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
            <div id={scannerRegionId} style={{ borderRadius: '8px', overflow: 'hidden' }}></div>
            {cameras.length > 1 && (
              <IconButton
                onClick={handleFlipCamera}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  }
                }}
              >
                <FlipCameraIosIcon />
              </IconButton>
            )}
        </Box>
      )}

      {cameraError && (
         <Alert severity="error" sx={{ mt: 2 }}>{cameraError}</Alert>
      )}

      {scannedResult && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success" icon={<QrCodeScannerIcon fontSize="inherit" />} sx={{ justifyContent: 'center' }}>
            <Typography variant="h6">Vị trí xe của bạn đã lưu thành công!</Typography>
            <Typography><strong>{scannedResult}</strong></Typography>
          </Alert>
        </Box>
      )}
      
      {!isScanning && (
        <Button 
            variant="contained" 
            onClick={handleRescan} 
            startIcon={<ReplayIcon />}
            sx={{ mt: 3 }}
        >
            Lưu xe khác
        </Button>
      )}
    </Box>
  );
};

export default SaveSlotPage;
