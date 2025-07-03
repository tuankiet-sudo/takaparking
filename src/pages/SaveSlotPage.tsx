// src/pages/SaveSlotPage.tsx
import { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReplayIcon from '@mui/icons-material/Replay';

const SaveSlotPage = () => {
  // State to hold the scanned data
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  // State to handle camera permission errors
  const [cameraError, setCameraError] = useState<string | null>(null);
  // State to control rescanning
  const [isScanning, setIsScanning] = useState(true);

  const handleScanResult = (result: any, error: any) => {
    if (result) {
      // A result has been successfully scanned
      setScannedResult(result?.text);
      setIsScanning(false); // Stop scanning after a successful scan
    }

    if (error) {
      // Handle potential errors, like permission denied
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt để sử dụng tính năng này.');
        setIsScanning(false);
      } else if (error.name === 'NotFoundError') {
        setCameraError('Không tìm thấy camera trên thiết bị này.');
        setIsScanning(false);
      }
    }
  };
  
  const handleRescan = () => {
    setScannedResult(null);
    setCameraError(null);
    setIsScanning(true);
  }

  return (
    <Box sx={{ padding: 2, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Quét mã QR để lưu vị trí
      </Typography>

      {/* Conditional rendering based on state */}
      {isScanning && (
        <Box sx={{ width: '100%', maxWidth: '400px', margin: '0 auto', border: '2px solid #eee', borderRadius: '16px', overflow: 'hidden' }}>
          <QrReader
            onResult={handleScanResult}
            constraints={{ facingMode: 'environment' }}
            scanDelay={500}
            ViewFinder={() => ( // Custom viewfinder to guide the user
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Box sx={{
                  width: '60%',
                  height: '60%',
                  border: '4px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: '16px',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                }}/>
              </Box>
            )}
          />
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
      
      {/* Show the rescan button if scanning is stopped for any reason */}
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
