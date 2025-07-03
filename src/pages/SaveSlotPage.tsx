// src/pages/SaveSlotPage.tsx
import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useQrReader } from 'react-qr-reader';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReplayIcon from '@mui/icons-material/Replay';

// This is a dedicated component for the scanner to make it easier to re-initialize
const Scanner = ({ onScanResult, onScanError }: { onScanResult: (result: string) => void, onScanError: (error: Error) => void }) => {
  useQrReader({
    // This is the key change: we are now using the hook's callback-based API
    onResult: (result, error) => {
      if (result) {
        onScanResult(result.getText());
      }

      if (error) {
        onScanError(error);
      }
    },
    constraints: { facingMode: 'environment' },
  });

  // The library now expects a <video> element to be rendered by us.
  // It will automatically find this element and attach the camera stream.
  // We add a simple viewfinder overlay on top of it.
  return (
    <Box sx={{
      width: '100%',
      paddingTop: '100%', // Creates a square aspect ratio
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '2px solid #eee',
      backgroundColor: '#000' // Black background for loading state
    }}>
      {/* The video element is now explicitly part of our component */}
      {/* The library will find this and use it. */}
      <video style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover' // Ensures the video covers the area without distortion
      }} />

      {/* A simpler, more reliable viewfinder */}
      <Box sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60%',
          height: '60%',
          border: '4px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
      }}/>
    </Box>
  );
};

const SaveSlotPage = () => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleScanResult = (result: string) => {
    setScannedResult(result);
    setIsScanning(false);
  };
  
  const handleScanError = (error: Error) => {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      setCameraError('Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.');
      setIsScanning(false);
    } else if (error.name === "NotFoundError") {
      setCameraError('Không tìm thấy camera trên thiết bị này.');
      setIsScanning(false);
    } else if (error.name === "NotReadableError") {
      setCameraError('Không thể truy cập camera. Nó có thể đang được sử dụng bởi một ứng dụng khác.');
      setIsScanning(false);
    }
  };

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

      <Box sx={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        {isScanning ? (
          <Scanner onScanResult={handleScanResult} onScanError={handleScanError} />
        ) : (
          <Box sx={{
            width: '100%',
            paddingTop: '100%',
            backgroundColor: '#e0e0e0',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography color="textSecondary">Camera Tắt</Typography>
          </Box>
        )}
      </Box>

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
