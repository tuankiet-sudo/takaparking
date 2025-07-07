import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- Configuration for the map ---
const NUM_COLS = 12; // A to L
const NUM_ROWS = 9;  // 1 to 9
const MAX_SLOTS_PER_COL = 10;
const GRID_SIZE = 150;
const COLUMN_SIZE = 70;
const ZOOM_SENSITIVITY = 0.5;
const RUNWAY_SIZE = GRID_SIZE * 0.5;

const elevators = [
    { name: "Thang máy Zone A", betweenCols: [3, 4], spansRows: [2, 4], orientation: 'vertical' },
    { name: "Thang máy Zone B", betweenRows: [5, 6], spansCols: [8, 10], orientation: 'horizontal' },
    { name: "Thang máy văn phòng", betweenRows: [1, 2], spansCols: [9, 11], orientation: 'horizontal' },
];

// --- Definitions for different areas ---
const CAR_PARKING_AREA = { startCol: 5, endCol: 8, startRow: 1, endRow: 4 };
const BOOKING_AREA = { startCol: 1, endCol: 12, startRow: 9, endRow: 9 };
// MODIFIED: Scanning area now extends to column D
const SCANNING_AREA = { startCol: 1, endCol: 4, startRow: 1, endRow: 4 };

// --- Hardcoded Data for Available Slots ---
const availableSlotsData: { [key: string]: number } = {
    'A1': 7, 'A2': 10, 'A3': 8, 'A4': 9, 'A5': 10, 'A6': 5, 'A7': 6, 'A8': 10,
    'B1': 3, 'B2': 5, 'B3': 8, 'B4': 9, 'B5': 10, 'B6': 5, 'B7': 6, 'B8': 0,
    'C1': 0, 'C2': 1, 'C3': 4, 'C4': 8, 'C5': 9, 'C6': 2, 'C7': 3, 'C8': 5,
    'D1': 10, 'D2': 10, 'D3': 10, 'D4': 8, 'D5': 9, 'D6': 7, 'D7': 6, 'D8': 8,
    'E5': 9, 'E6': 7, 'E7': 6, 'E8': 8,
    'F1': 10, 'F2': 10, 'F3': 10, 'F4': 8, 'F5': 0, 'F6': 7, 'F7': 6, 'F8': 8,
    'G1': 10, 'G2': 10, 'G3': 10, 'G4': 8, 'G5': 9, 'G6': 7, 'G7': 6, 'G8': 8,
    'H1': 10, 'H2': 10, 'H3': 10, 'H4': 8, 'H5': 9, 'H6': 7, 'H7': 6, 'H8': 8,
    'I1': 10, 'I2': 10, 'I3': 10, 'I4': 8, 'I5': 9, 'I6': 7, 'I7': 6, 'I8': 8,
    'J1': 10, 'J2': 10, 'J3': 10, 'J4': 8, 'J5': 9, 'J6': 7, 'J7': 6, 'J8': 8,
    'K1': 2, 'K2': 0, 'K3': 1, 'K4': 3, 'K5': 5, 'K6': 4, 'K7': 8, 'K8': 9,
    'L1': 6, 'L2': 8, 'L3': 9, 'L4': 10, 'L5': 10, 'L6': 8, 'L7': 7, 'L8': 9,
    // ADDED: Data for row 9
    'A9': 5, 'B9': 8, 'C9': 10, 'D9': 0, 'E9': 4, 'F9': 7,
    'G9': 9, 'H9': 10, 'I9': 3, 'J9': 6, 'K9': 8, 'L9': 10,
};

const FindSlotMapPage = () => {
    const navigate = useNavigate();
    const { basementId } = useParams<{ basementId: string }>();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [zoom, setZoom] = useState(0.7);
    const [offset, setOffset] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);

    const getSlotColor = (available: number): string => {
        if (available === 0) return '#E53935'; // Red for full
        if (available <= 3) return '#FFA726'; // Orange for few
        return '#66BB6A'; // Green for available
    };

    const isColumnUnavailable = (col: number, row: number): boolean => {
        if (col >= CAR_PARKING_AREA.startCol && col <= CAR_PARKING_AREA.endCol &&
            row >= CAR_PARKING_AREA.startRow && row <= CAR_PARKING_AREA.endRow) {
            return true;
        }
    
        if (basementId === 'b3') {
            if (col >= BOOKING_AREA.startCol && col <= BOOKING_AREA.endCol &&
                row >= BOOKING_AREA.startRow && row <= BOOKING_AREA.endRow) {
                return true;
            }
            if (col >= SCANNING_AREA.startCol && col <= SCANNING_AREA.endCol &&
                row >= SCANNING_AREA.startRow && row <= SCANNING_AREA.endRow) {
                return true;
            }
        }
    
        return false;
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        ctx.fillStyle = '#f5f5f5';
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.font = 'italic 28px Arial';
        ctx.textAlign = 'center';

        const carArea = CAR_PARKING_AREA;
        const carAreaRunwayXStart = carArea.startCol > 4 ? RUNWAY_SIZE : 0;
        const carAreaRunwayYStart = carArea.startRow > 4 ? RUNWAY_SIZE : 0;
        const carRectX = carArea.startCol * GRID_SIZE + carAreaRunwayXStart - (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectY = carArea.startRow * GRID_SIZE + carAreaRunwayYStart - (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectEndX = carArea.endCol * GRID_SIZE + (carArea.endCol > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectEndY = carArea.endRow * GRID_SIZE + (carArea.endRow > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
        ctx.fillRect(carRectX, carRectY, carRectEndX - carRectX, carRectEndY - carRectY);
        ctx.strokeRect(carRectX, carRectY, carRectEndX - carRectX, carRectEndY - carRectY);
        ctx.fillStyle = '#bdbdbd';
        ctx.fillText('Khu vực dành cho xe hơi', carRectX + (carRectEndX - carRectX) / 2, carRectY + (carRectEndY - carRectY) / 2);

        if (basementId === 'b3') {
            const bookingArea = BOOKING_AREA;
            const bookingAreaRunwayXStart = bookingArea.startCol > 4 ? RUNWAY_SIZE : 0;
            const bookingAreaRunwayYStart = bookingArea.startRow > 4 ? RUNWAY_SIZE : 0;
            const bookingRectX = bookingArea.startCol * GRID_SIZE + bookingAreaRunwayXStart - (GRID_SIZE - COLUMN_SIZE) / 2;
            const bookingRectY = bookingArea.startRow * GRID_SIZE + bookingAreaRunwayYStart - (GRID_SIZE - COLUMN_SIZE) / 2;
            const bookingRectEndX = bookingArea.endCol * GRID_SIZE + (bookingArea.endCol > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
            const bookingRectEndY = bookingArea.endRow * GRID_SIZE + (bookingArea.endRow > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(bookingRectX, bookingRectY, bookingRectEndX - bookingRectX, bookingRectEndY - bookingRectY);
            ctx.strokeRect(bookingRectX, bookingRectY, bookingRectEndX - bookingRectX, bookingRectEndY - bookingRectY);
            ctx.fillStyle = '#bdbdbd';
            ctx.fillText('Khu vực dành cho booking', bookingRectX + (bookingRectEndX - bookingRectX) / 2, bookingRectY + (bookingRectEndY - bookingRectY) / 2 + 60);
        }

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        for (let y = 1; y <= NUM_ROWS; y++) {
            for (let x = 1; x <= NUM_COLS; x++) {
                const labelKey = `${String.fromCharCode(64 + x)}${y}`;
                const runwayOffsetX = x > 4 ? RUNWAY_SIZE : 0;
                const runwayOffsetY = y > 4 ? RUNWAY_SIZE : 0;
                const posX = x * GRID_SIZE + runwayOffsetX;
                const posY = y * GRID_SIZE + runwayOffsetY;
                
                if (isColumnUnavailable(x, y)) {
                    ctx.fillStyle = '#e0e0e0';
                    ctx.fillRect(posX, posY, COLUMN_SIZE, COLUMN_SIZE);
                    ctx.fillStyle = 'black';
                    ctx.font = 'bold 22px Arial';
                    ctx.fillText(labelKey, posX + COLUMN_SIZE / 2, posY + COLUMN_SIZE / 2);
                } else {
                    const availableCount = availableSlotsData[labelKey] ?? 0;
                    ctx.fillStyle = getSlotColor(availableCount);
                    ctx.fillRect(posX, posY, COLUMN_SIZE, COLUMN_SIZE);
                    
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 22px Arial';
                    ctx.fillText(labelKey, posX + COLUMN_SIZE / 2, posY + COLUMN_SIZE / 3);
                    ctx.font = '18px Arial';
                    const slotText = `${availableCount}/${MAX_SLOTS_PER_COL}`;
                    ctx.fillText(slotText, posX + COLUMN_SIZE / 2, posY + (COLUMN_SIZE / 3) * 2 + 5);
                }
            }
        }

        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const entranceX = 1 * GRID_SIZE;
        const entranceY = 1 * GRID_SIZE - COLUMN_SIZE - 20;
        const entranceWidth =  GRID_SIZE + COLUMN_SIZE;
        const entranceHeight = COLUMN_SIZE;
        ctx.fillStyle = '#e8f5e9';
        ctx.strokeStyle = '#a5d6a7';
        ctx.lineWidth = 2;
        ctx.fillRect(entranceX, entranceY, entranceWidth, entranceHeight);
        ctx.strokeRect(entranceX, entranceY, entranceWidth, entranceHeight);
        ctx.fillStyle = '#388e3c';
        ctx.fillText('LỐI VÀO', entranceX + entranceWidth / 2, entranceY + entranceHeight / 2);

        const exitRunwayOffset = 11 > 4 ? RUNWAY_SIZE : 0;
        const exitX = 11 * GRID_SIZE + exitRunwayOffset;
        const exitY = entranceY;
        const exitWidth = entranceWidth;
        const exitHeight = entranceHeight;
        ctx.fillStyle = '#ffebee';
        ctx.strokeStyle = '#ef9a9a';
        ctx.lineWidth = 2;
        ctx.fillRect(exitX, exitY, exitWidth, exitHeight);
        ctx.strokeRect(exitX, exitY, exitWidth, exitHeight);
        ctx.fillStyle = '#c62828';
        ctx.fillText('LỐI RA', exitX + exitWidth / 2, exitY + exitHeight / 2);

        ctx.font = 'bold 20px Arial';
        elevators.forEach(elevator => {
            let centerX, centerY, width, height;
            if (elevator.orientation === 'vertical') {
                const col = elevator.betweenCols![0];
                const startRow = elevator.spansRows![0];
                const endRow = elevator.spansRows![1];
                const runwayOffsetX = col > 4 ? RUNWAY_SIZE : 0;
                const startRunwayY = startRow > 4 ? RUNWAY_SIZE : 0;
                centerX = col * GRID_SIZE + runwayOffsetX + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
                const startY = startRow * GRID_SIZE + startRunwayY;
                const endY = endRow * GRID_SIZE + (endRow > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE;
                centerY = startY + (endY - startY) / 2;
                width = COLUMN_SIZE;
                height = endY - startY;
            } else {
                const row = elevator.betweenRows![0];
                const startCol = elevator.spansCols![0];
                const endCol = elevator.spansCols![1];
                const runwayOffsetY = row > 4 ? RUNWAY_SIZE : 0;
                const startRunwayX = startCol > 4 ? RUNWAY_SIZE : 0;
                centerY = row * GRID_SIZE + runwayOffsetY + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
                const startX = startCol * GRID_SIZE + startRunwayX;
                const endX = endCol * GRID_SIZE + (endCol > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE;
                centerX = startX + (endX - startX) / 2;
                height = COLUMN_SIZE;
                width = endX - startX;
            }
            ctx.fillStyle = '#bdbdbd';
            ctx.strokeStyle = '#757575';
            ctx.lineWidth = 1;
            ctx.fillRect(centerX - width / 2, centerY - height / 2, width, height);
            ctx.strokeRect(centerX - width / 2, centerY - height / 2, width, height);
            ctx.fillStyle = '#757575';
            ctx.save();
            ctx.translate(centerX, centerY);
            if (elevator.orientation === 'vertical') ctx.rotate(-Math.PI / 2);
            ctx.fillText(elevator.name, 0, 0);
            ctx.restore();
        });

        ctx.restore();
    };

    const handleWheel = (event: WheelEvent) => { event.preventDefault(); const scaleAmount = 1.1; setZoom(prevZoom => { const newZoom = event.deltaY < 0 ? prevZoom * scaleAmount : prevZoom / scaleAmount; return Math.max(0.3, Math.min(newZoom, 5)); }); };
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => { setIsDragging(true); setLastDragPosition({ x: event.clientX, y: event.clientY }); };
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => { if (!isDragging) return; const dx = event.clientX - lastDragPosition.x; const dy = event.clientY - lastDragPosition.y; setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); setLastDragPosition({ x: event.clientX, y: event.clientY }); };
    const handleMouseUp = () => setIsDragging(false);
    const getDistance = (touches: React.TouchList) => { return Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2)); };
    const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => { if (event.touches.length === 1) { setIsDragging(true); setLastDragPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY }); } else if (event.touches.length === 2) { setInitialPinchDistance(getDistance(event.touches)); } };
    const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => { event.preventDefault(); if (event.touches.length === 1 && isDragging) { const dx = event.touches[0].clientX - lastDragPosition.x; const dy = event.touches[0].clientY - lastDragPosition.y; setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); setLastDragPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY }); } else if (event.touches.length === 2 && initialPinchDistance) { const newDistance = getDistance(event.touches); const scaleFactor = newDistance / initialPinchDistance; const adjustedScaleFactor = 1 + (scaleFactor - 1) * ZOOM_SENSITIVITY; setZoom(prevZoom => Math.max(0.3, Math.min(prevZoom * adjustedScaleFactor, 5))); } };
    const handleTouchEnd = () => { setIsDragging(false); setInitialPinchDistance(null); };

    useEffect(() => {
        draw();
    }, [zoom, offset, basementId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
            return () => canvas.removeEventListener('wheel', handleWheel);
        }
    }, [zoom]);


    return (
        <Box sx={{  display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
            <Paper elevation={1} sx={{ top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        Bản đồ hầm {basementId?.toUpperCase()}
                    </Typography>
                </Box>
            </Paper>
            <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}>
                <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
            </Box>
        </Box>
    );
};

export default FindSlotMapPage;
