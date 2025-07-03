// src/pages/SaveSlotPage.tsx
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

    // This function will be called when the component mounts or when isScanning becomes true
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;

    try {
        html5QrcodeScanner = new Html5QrcodeScanner(
            scannerRegionId,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                // Important: This can help on mobile devices
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                },
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

        const onScanFailure = (_: any) => {
            // This callback is often verbose, so we can choose to ignore it.
            // console.warn(`Code scan error = ${error}`);
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    } catch (error) {
        console.error("Failed to start html5QrcodeScanner.", error);
    }


    // Cleanup function to run when the component unmounts
    return () => {
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

      {/* This div is the container where the scanner will be injected */}
      {isScanning && <div id="html5qr-code-full-region"></div>}

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
