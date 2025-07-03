// src/pages/SaveSlotPage.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode'; // Import the main class
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReplayIcon from '@mui/icons-material/Replay';

const SaveSlotPage = () => {
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
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Quét mã QR để lưu vị trí
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
            <Typography variant="h6">Đã lưu vị trí!</Typography>
            <Typography>Vị trí của bạn: <strong>{scannedResult}</strong></Typography>
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
            Quét lại
        </Button>
      )}
    </Box>
  );
};

export default SaveSlotPage;
