import { useState, useEffect, useRef } from 'react';
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
  
  // --- ADDED: State for camera management ---
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  
  // Use a ref to hold the html5-qrcode instance
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = "html5qr-code-full-region";

  // --- Effect to initialize and manage the scanner ---
  useEffect(() => {
    if (!isScanning) {
      // Stop the scanner if it's running and we are no longer in scanning mode
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner.", err));
      }
      return;
    }

    const setupScanner = async () => {
      try {
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setCameras(devices);
          // Set initial camera if not already set
          if (!activeCameraId) {
            const backCamera = devices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('sau'));
            setActiveCameraId(backCamera ? backCamera.id : devices[0].id);
          }
        } else {
          setCameraError("Không tìm thấy camera nào trên thiết bị.");
        }
      } catch (err) {
        console.error("Error getting cameras:", err);
        setCameraError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
      }
    };

    setupScanner();

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => {
          console.error("Failed to stop scanner on cleanup", err);
        });
      }
    };
  }, [isScanning]); // Rerun setup when isScanning changes

  // --- Effect to start/restart the scanner when the active camera changes ---
  useEffect(() => {
    if (isScanning && activeCameraId) {
      // Ensure the instance is created
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerRegionId, {
            verbose: false // Optional: turn off verbose logging
        });
      }
      
      const qrCode = html5QrCodeRef.current;

      // Stop previous scanner if it's running
      if (qrCode.isScanning) {
        qrCode.stop();
      }

      // Start new scanner with the active camera
      qrCode.start(
        activeCameraId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => {
          setScannedResult(decodedText);
          setIsScanning(false);
        },
        () => {} // Optional scan failure callback
      ).catch(err => {
        console.error(`Error starting scanner with camera ${activeCameraId}:`, err);
        setCameraError("Lỗi khi khởi động camera được chọn.");
      });
    }
  }, [isScanning, activeCameraId]); // Rerun when active camera changes

  const handleRescan = () => {
    setScannedResult(null);
    setCameraError(null);
    setIsScanning(true);
  };

  // --- ADDED: Handler to flip the camera ---
  const handleFlipCamera = () => {
    if (cameras.length > 1 && activeCameraId) {
      const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
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
