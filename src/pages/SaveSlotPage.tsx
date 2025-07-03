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

    // --- Custom Styling Injection ---
    const style = document.createElement('style');
    style.innerHTML = `
      #${scannerRegionId} {
        border: none !important;
        position: relative;
        width: 100%;
        padding-top: 100%;
        border-radius: 16px;
        overflow: hidden;
        background-color: #000;
      }
      #${scannerRegionId} video {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
      .viewfinder-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .viewfinder-box {
        width: 60%;
        height: 60%;
        border: 4px solid rgba(255, 255, 255, 0.8);
        border-radius: 16px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      }
    `;
    document.head.appendChild(style);
    // --- End of Custom Styling ---

    const html5QrCode = new Html5Qrcode(scannerRegionId);

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // Find the back camera
          let cameraId = devices[0].id; // Default to the first camera
          const backCamera = devices.find(device => device.label.toLowerCase().includes('back'));
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
      document.head.removeChild(style);
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
