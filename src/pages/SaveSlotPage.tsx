// src/pages/SaveSlotPage.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Paper, IconButton } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode'; // Import the main class
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReplayIcon from '@mui/icons-material/Replay';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const SaveSlotPage = () => {
  const navigate = useNavigate();
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isScanning) return;

    const scannerRegionId = "html5qr-code-full-region";

    // --- End of Custom Styling ---

    const html5QrCode = new Html5Qrcode(scannerRegionId);

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // Find the back camera
          let cameraId = devices[0].id; // Default to the first camera
          const backCamera = devices.find(device => device.label.toLowerCase().includes('sau'));
          if (backCamera) {
            cameraId = backCamera.id;
          }

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              setScannedResult(decodedText);
              setIsScanning(false);
              html5QrCode.stop().catch(err => console.error("Failed to stop scanner on success", err));
            },
            () => {} // Optional scan failure callback
          );
        } else {
            setCameraError("Không tìm thấy camera nào trên thiết bị.");
        }
      } catch (err: any) {
        console.error("Error starting scanner:", err);
        setCameraError("Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => {
          console.error("Failed to stop scanner on cleanup", err);
        });
      }
    };
  }, [isScanning]);

  const handleRescan = () => {
    setScannedResult(null);
    setCameraError(null);
    setIsScanning(true);
  };

  return (
    <Box sx={{ padding: 2, textAlign: 'center' }}>
      <Paper elevation={1} sx={{ top: 0, zIndex: 10, bgcolor: 'white' }}>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
              <IconButton onClick={() => navigate(-1)}>
                  <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                Lưu vị trí xe
              </Typography>
          </Box>
      </Paper>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Hãy quét mã QR trên cột để lưu vị trí xe của bạn
      </Typography>

      {isScanning && (
        <Box sx={{ width: '100%', maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
            <div id="html5qr-code-full-region"></div>
            <div className="viewfinder-overlay">
                <div className="viewfinder-box" />
            </div>
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
