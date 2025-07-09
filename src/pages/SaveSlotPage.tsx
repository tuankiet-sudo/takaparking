import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Paper, IconButton, Snackbar } from '@mui/material';
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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const scannerRegionId = "html5qr-code-full-region";

    // --- Effect 1: Get available cameras on component mount ---
    useEffect(() => {
        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices && devices.length) {
                    setCameras(devices);
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
    }, []);

    // --- Effect 2: Manage the scanner lifecycle ---
    useEffect(() => {
        if (!isScanning || !activeCameraId) return;

        const html5QrCode = new Html5Qrcode(scannerRegionId, { verbose: false });

        const onScanSuccess = (decodedText: string) => {
            setIsScanning(false);
            try {
                // Expected format: "B3-A1", "B4-C5", etc.
                throw new Error(decodedText);
                const parts = decodedText.split('-');
                if (parts.length !== 2 || !parts[0].startsWith('B') || !/^[A-L]\d{1,2}$/.test(parts[1])) {
                    throw new Error("Mã QR không hợp lệ. Vui lòng quét lại.");
                }

                const locationToSave = {
                    position: `Hầm ${parts[0]}. Cột ${parts[1]}`
                };

                // Save the location to localStorage
                localStorage.setItem('savedVehicle', JSON.stringify(locationToSave));
                
                setScannedResult(locationToSave.position);
                setSnackbarMessage("Đã lưu vị trí thành công!");
                setSnackbarOpen(true);

            } catch (error: any) {
                setSnackbarMessage(error.message);
                setSnackbarOpen(true);
                setScannedResult(null);
            }
        };

        html5QrCode.start(
            activeCameraId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onScanSuccess,
            () => {}
        ).catch(err => {
            setCameraError("Không thể khởi động camera.");
            console.error("Error starting scanner:", err);
        });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error("Failed to stop scanner cleanly.", err));
            }
        };
    }, [isScanning, activeCameraId]);

    const handleRescan = () => {
        setScannedResult(null);
        setCameraError(null);
        setIsScanning(true);
    };

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
                    <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
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
                        <IconButton onClick={handleFlipCamera} sx={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}>
                            <FlipCameraIosIcon />
                        </IconButton>
                    )}
                </Box>
            )}

            {cameraError && <Alert severity="error" sx={{ mt: 2 }}>{cameraError}</Alert>}

            {scannedResult && (
                <Box sx={{ mt: 3 }}>
                    <Alert severity="success" icon={<QrCodeScannerIcon fontSize="inherit" />} sx={{ justifyContent: 'center' }}>
                        <Typography variant="h6">Vị trí xe của bạn đã lưu thành công!</Typography>
                        <Typography><strong>{scannedResult}</strong></Typography>
                    </Alert>
                </Box>
            )}
            
            {!isScanning && (
                <Button variant="contained" onClick={handleRescan} startIcon={<ReplayIcon />} sx={{ mt: 3 }}>
                    Quét lại
                </Button>
            )}
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
        </Box>
    );
};

export default SaveSlotPage;
