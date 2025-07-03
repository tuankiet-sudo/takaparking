import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReplayIcon from '@mui/icons-material/Replay';

const SaveSlotPage = () => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

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
        padding-top: 100%; /* Creates a square aspect ratio */
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
      #${scannerRegionId} button, #${scannerRegionId} span, #${scannerRegionId} br {
        display: none !important; /* Hides the library's default UI elements */
      }
      .viewfinder-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
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

    let html5QrcodeScanner: Html5QrcodeScanner | null = null;

    try {
        html5QrcodeScanner = new Html5QrcodeScanner(
            scannerRegionId,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                // This is the crucial part for selecting the back camera
                videoConstraints: {
                    facingMode: { exact: "environment" }
                }
            },
            /* verbose= */ false
        );

        const onScanSuccess = (decodedText: string) => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear();
            }
            setScannedResult(decodedText);
            setIsScanning(false);
        };

        const onScanFailure = (_: any) => {};

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    } catch (error) {
        console.error("Failed to start html5QrcodeScanner.", error);
    }

    return () => {
      document.head.removeChild(style);
      if (html5QrcodeScanner && html5QrcodeScanner.getState()) {
         html5QrcodeScanner.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner.", error);
         });
      }
    };
  }, [isScanning]);

  const handleRescan = () => {
    setScannedResult(null);
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
            <Box className="viewfinder-overlay" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box className="viewfinder-box" />
            </Box>
        </Box>
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
