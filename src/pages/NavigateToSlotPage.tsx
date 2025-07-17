import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, IconButton, Stack, Fab, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// --- (ICON) Add new icons for the TTS button ---
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

// --- Configuration for the map ---
const NUM_COLS = 12; // A to L
const NUM_ROWS = 9;  // 1 to 9
const GRID_SIZE = 150;
const COLUMN_SIZE = 50;
const ZOOM_SENSITIVITY = 0.5;
const RUNWAY_SIZE = GRID_SIZE * 0.5;
const USER_START_COL = 3;
const USER_START_ROW = 2;
const USER_POSITION = { x: USER_START_COL * GRID_SIZE + 25, y: USER_START_ROW * GRID_SIZE + GRID_SIZE / 2 };
const EXIT_NODE_COORDINATES = { x: 11, y: 1 };

const elevators = [
    { name: "Thang máy Zone A", betweenCols: [3, 4], spansRows: [2, 4], orientation: 'vertical' },
    { name: "Thang máy Zone B", betweenRows: [5, 6], spansCols: [8, 10], orientation: 'horizontal' },
    { name: "Thang máy văn phòng", betweenRows: [1, 2], spansCols: [9, 11], orientation: 'horizontal' },
];

const CAR_PARKING_AREA = { startCol: 5, endCol: 8, startRow: 1, endRow: 4 };
const BOOKING_AREA = { startCol: 1, endCol: 12, startRow: 9, endRow: 9 };

// --- A* Pathfinding Implementation (Unchanged) ---
class Node {
    x: number; y: number; isObstacle: boolean; g: number = 0; h: number = 0; f: number = 0; parent: Node | null = null;
    constructor(x: number, y: number, isObstacle = false) { this.x = x; this.y = y; this.isObstacle = isObstacle; }
}

const findPath = (startNode: Node, endNode: Node, grid: Node[][]): Node[] => {
    const openList: Node[] = [startNode];
    const closedList: Node[] = [];
    while (openList.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openList.length; i++) { if (openList[i].f < openList[lowestIndex].f) lowestIndex = i; }
        const currentNode = openList[lowestIndex];
        if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
            let path: Node[] = [], temp: Node | null = currentNode;
            while (temp) { path.push(temp); temp = temp.parent; }
            return path.reverse();
        }
        openList.splice(lowestIndex, 1);
        closedList.push(currentNode);
        const neighbors: Node[] = [];
        const { x, y } = currentNode;
        if (grid[x - 1]?.[y]) neighbors.push(grid[x - 1][y]);
        if (grid[x + 1]?.[y]) neighbors.push(grid[x + 1][y]);
        if (grid[x]?.[y - 1]) neighbors.push(grid[x][y - 1]);
        if (grid[x]?.[y + 1]) neighbors.push(grid[x][y + 1]);
        for (const neighbor of neighbors) {
            if (closedList.some(n => n.x === neighbor.x && n.y === neighbor.y) || neighbor.isObstacle) continue;
            const gScore = currentNode.g + 1;
            let gScoreIsBest = false;
            if (!openList.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                gScoreIsBest = true;
                neighbor.h = Math.abs(neighbor.x - endNode.x) + Math.abs(neighbor.y - endNode.y);
                openList.push(neighbor);
            } else if (gScore < neighbor.g) { gScoreIsBest = true; }
            if (gScoreIsBest) { neighbor.parent = currentNode; neighbor.g = gScore; neighbor.f = neighbor.g + neighbor.h; }
        }
    }
    return [];
};

const deepCloneGrid = (grid: Node[][]): Node[][] => {
    return grid.map(col => col.map(node => new Node(node.x, node.y, node.isObstacle)));
};

const NavigateToSlotPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [zoom, setZoom] = useState(0.7);
    const [offset, setOffset] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const [vehiclePosition, setVehiclePosition] = useState({ x: 0, y: 0 });
    const [pathToVehicle, setPathToVehicle] = useState<Node[]>([]);
    const [pathToExit, setPathToExit] = useState<Node[]>([]);
    const [pageTitle, setPageTitle] = useState('Bản đồ bãi đỗ xe');
    // --- (STATE) New state to manage TTS loading status ---
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [vehicleLocation, setVehicleLocation] = useState('');

    // --- Effect to calculate paths based on saved location ---
    useEffect(() => {
        const savedVehicleData = localStorage.getItem('savedVehicle');
        if (!savedVehicleData) {
            console.error("No saved vehicle found in localStorage.");
            setPageTitle("Không tìm thấy xe");
            return;
        }

        const savedVehicle: { position: string } = JSON.parse(savedVehicleData);
        const parts = savedVehicle.position.match(/Cột ([A-L])(\d{1,2})/);
        if (!parts) {
            console.error("Invalid position format in localStorage:", savedVehicle.position);
            return;
        }

        const colLetter = parts[1];
        const rowNumber = parseInt(parts[2], 10);
        const colIndex = colLetter.charCodeAt(0) - 64;

        const vehicleLocationString = `${colLetter}${rowNumber}`;
        setVehicleLocation(vehicleLocationString);
        setPageTitle(`Bản đồ đến cột ${vehicleLocationString}`);

        const cols = NUM_COLS + 1;
        const rows = NUM_ROWS + 1;
        const baseGrid: Node[][] = Array(cols).fill(null).map((_, x) => Array(rows).fill(null).map((__, y) => new Node(x, y)));
        
        elevators.forEach(elevator => {
            if (elevator.orientation === 'vertical') {
                const col = elevator.betweenCols![0];
                for (let row = elevator.spansRows![0]; row <= elevator.spansRows![1]; row++) { if(baseGrid[col]?.[row]) baseGrid[col][row].isObstacle = true; }
            } else {
                const row = elevator.betweenRows![0];
                for (let col = elevator.spansCols![0]; col <= elevator.spansCols![1]; col++) { if(baseGrid[col]?.[row]) baseGrid[col][row].isObstacle = true; }
            }
        });

        const vehicleRunwayOffsetX = colIndex > 4 ? RUNWAY_SIZE : 0;
        const vehicleRunwayOffsetY = rowNumber > 4 ? RUNWAY_SIZE : 0;
        setVehiclePosition({ x: colIndex * GRID_SIZE + vehicleRunwayOffsetX, y: rowNumber * GRID_SIZE + vehicleRunwayOffsetY });
        
        const gridForPath1 = deepCloneGrid(baseGrid);
        const startNode = gridForPath1[USER_START_COL - 1][USER_START_ROW];
        const vehicleNode = gridForPath1[colIndex][rowNumber];
        startNode.isObstacle = false;
        vehicleNode.isObstacle = false;
        const calculatedPathToVehicle = findPath(startNode, vehicleNode, gridForPath1);
        setPathToVehicle(calculatedPathToVehicle);
        
        const gridForPath2 = deepCloneGrid(baseGrid);
        const vehicleNodeForExit = gridForPath2[colIndex][rowNumber];
        const exitNode = gridForPath2[EXIT_NODE_COORDINATES.x][EXIT_NODE_COORDINATES.y];
        vehicleNodeForExit.isObstacle = false;
        exitNode.isObstacle = false;
        const calculatedPathToExit = findPath(vehicleNodeForExit, exitNode, gridForPath2);
        setPathToExit(calculatedPathToExit);

    }, []);

    // --- (NEW) Function to generate spoken directions from the path ---
    const generateSpokenDirections = (path: Node[], targetLocation: string): string => {
        // 1. Handle edge cases where the path is too short to have directions.
        if (path.length < 2) {
            return `Bạn đã ở ngay tại vị trí cột ${targetLocation}.`;
        }

        const directions: string[] = [`Bắt đầu chỉ đường đến cột ${targetLocation}.`];
        let straightCount = 0;
        
        // 2. Iterate through the path to calculate segments and turns.
        for (let i = 0; i < path.length - 1; i++) {
            straightCount++;
            
            // Check if a turn occurs at the next node (requires at least 3 points: current, next, and next-next)
            if (i < path.length - 2) {
                const currentNode = path[i];
                const nextNode = path[i+1];
                const futureNode = path[i+2];

                // Calculate direction vectors for the current and next segments
                const vector1 = { x: nextNode.x - currentNode.x, y: nextNode.y - currentNode.y };
                const vector2 = { x: futureNode.x - nextNode.x, y: futureNode.y - nextNode.y };

                // If the vectors are different, a turn has occurred.
                if (vector1.x !== vector2.x || vector1.y !== vector2.y) {
                    // Add the "go straight" instruction for the segment that just ended.
                    directions.push(`Đi thẳng ${straightCount} cột.`);
                    straightCount = 0; // Reset counter for the new segment

                    // 3. Use the cross-product to determine turn direction (left/right).
                    // This is a reliable way to determine rotation in 2D space.
                    const crossProduct = vector1.x * vector2.y - vector1.y * vector2.x;

                    if (crossProduct > 0) {
                        directions.push("Sau đó, rẽ phải.");
                    } else if (crossProduct < 0) {
                        directions.push("Sau đó, rẽ trái.");
                    }
                }
            }
        }

        // 4. Add the final "go straight" instruction for the last segment of the path.
        if (straightCount > 0) {
            directions.push(`Đi thẳng ${straightCount} cột.`);
        }

        // 5. Add the arrival message.
        directions.push(`Bạn đã đến nơi. Xe của bạn ở cột ${targetLocation}.`);
        

        return directions.join(' ');
    };


    // --- (NEW) Function to call the TTS API and play the audio ---
    const handleSpeak = async () => {
        if (isSpeaking || pathToVehicle.length === 0) return;

        setIsSpeaking(true);
        try {
            const directionsText = generateSpokenDirections(pathToVehicle, vehicleLocation);
            // const exitText = generateSpokenDirections(pathToExit, 'lối ra bãi đỗ xe');
            const response = await fetch('https://takaparking-be.vercel.app/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: directionsText }),
            });

            if (!response.ok) {
                throw new Error(`TTS API failed with status: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();

            audio.onended = () => {
                setIsSpeaking(false);
            };

        } catch (error) {
            console.error("Error fetching or playing TTS audio:", error);
            setIsSpeaking(false);
        }
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
        
        const carArea = CAR_PARKING_AREA;
        const carAreaRunwayXStart = carArea.startCol > 4 ? RUNWAY_SIZE : 0;
        const carAreaRunwayYStart = carArea.startRow > 4 ? RUNWAY_SIZE : 0;
        const carRectX = carArea.startCol * GRID_SIZE + carAreaRunwayXStart - (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectY = carArea.startRow * GRID_SIZE + carAreaRunwayYStart - (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectEndX = carArea.endCol * GRID_SIZE + (carArea.endCol > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectEndY = carArea.endRow * GRID_SIZE + (carArea.endRow > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(carRectX, carRectY, carRectEndX - carRectX, carRectEndY - carRectY);
        ctx.fillStyle = '#bdbdbd';
        ctx.font = 'italic 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Khu vực dành cho xe hơi', carRectX + (carRectEndX - carRectX) / 2, carRectY + (carRectEndY - carRectY) / 2);

        const bookingArea = BOOKING_AREA;
        const bookingAreaRunwayXStart = bookingArea.startCol > 4 ? RUNWAY_SIZE : 0;
        const bookingAreaRunwayYStart = bookingArea.startRow > 4 ? RUNWAY_SIZE : 0;
        const bookingRectX = bookingArea.startCol * GRID_SIZE + bookingAreaRunwayXStart - (GRID_SIZE - COLUMN_SIZE) / 2;
        const bookingRectY = bookingArea.startRow * GRID_SIZE + bookingAreaRunwayYStart - (GRID_SIZE - COLUMN_SIZE) / 2;
        const bookingRectEndX = bookingArea.endCol * GRID_SIZE + (bookingArea.endCol > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
        const bookingRectEndY = bookingArea.endRow * GRID_SIZE + (bookingArea.endRow > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(bookingRectX, bookingRectY, bookingRectEndX - bookingRectX, bookingRectEndY - bookingRectY);
        
        ctx.fillStyle = '#bdbdbd';
        ctx.font = 'italic 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Khu vực dành cho booking', bookingRectX + (bookingRectEndX - bookingRectX) / 2, bookingRectY + (bookingRectEndY - bookingRectY) / 2 + 60);

        ctx.font = 'bold 20px Arial';
        ctx.textBaseline = 'middle';
        for (let y = 1; y <= NUM_ROWS; y++) {
            for (let x = 1; x <= NUM_COLS; x++) {
                const runwayOffsetX = x > 4 ? RUNWAY_SIZE : 0;
                const runwayOffsetY = y > 4 ? RUNWAY_SIZE : 0;
                const posX = x * GRID_SIZE + runwayOffsetX;
                const posY = y * GRID_SIZE + runwayOffsetY;
                const isVehicleColumn = posX === vehiclePosition.x && posY === vehiclePosition.y;
                ctx.fillStyle = isVehicleColumn ? '#1976d2' : '#e0e0e0';
                ctx.fillRect(posX, posY, COLUMN_SIZE, COLUMN_SIZE);
                const label = `${String.fromCharCode(64 + x)}${y}`;
                ctx.fillStyle = isVehicleColumn ? 'white' : 'black';
                ctx.fillText(label, posX + COLUMN_SIZE / 2, posY + COLUMN_SIZE / 2);
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

        if (pathToVehicle.length > 0) {
            ctx.beginPath();
            ctx.moveTo(USER_POSITION.x, USER_POSITION.y);
            for (const node of pathToVehicle) {
                const runwayOffsetX = node.x > 4 ? RUNWAY_SIZE : 0;
                const runwayOffsetY = node.y > 4 ? RUNWAY_SIZE : 0;
                const pathX = node.x * GRID_SIZE + GRID_SIZE / 2 + runwayOffsetX;
                const pathY = node.y * GRID_SIZE + GRID_SIZE / 2 + runwayOffsetY;
                ctx.lineTo(pathX, pathY);
            }
            ctx.strokeStyle = '#E53935';
            ctx.lineWidth = 5;
            ctx.setLineDash([10, 10]);
            ctx.stroke();
        }

        if (pathToExit.length > 0) {
            const vehicleNode = pathToExit[0];
            const vehicleRunwayX = vehicleNode.x > 4 ? RUNWAY_SIZE : 0;
            const vehicleRunwayY = vehicleNode.y > 4 ? RUNWAY_SIZE : 0;
            const vehicleCenterX = vehicleNode.x * GRID_SIZE + GRID_SIZE / 2 + vehicleRunwayX;
            const vehicleCenterY = vehicleNode.y * GRID_SIZE + GRID_SIZE / 2 + vehicleRunwayY;

            ctx.beginPath();
            ctx.moveTo(vehicleCenterX, vehicleCenterY);
            for (const node of pathToExit) {
                const runwayOffsetX = node.x > 4 ? RUNWAY_SIZE : 0;
                const runwayOffsetY = node.y > 4 ? RUNWAY_SIZE : 0;
                const pathX = node.x * GRID_SIZE + GRID_SIZE / 2 + runwayOffsetX;
                const pathY = node.y * GRID_SIZE + GRID_SIZE / 2 + runwayOffsetY;
                ctx.lineTo(pathX, pathY);
            }
            ctx.strokeStyle = '#FFC107';
            ctx.lineWidth = 5;
            ctx.setLineDash([10, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(USER_POSITION.x, USER_POSITION.y, COLUMN_SIZE / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('BẠN', USER_POSITION.x, USER_POSITION.y);
        ctx.restore();
    };

    useEffect(() => {
        draw();
    }, [zoom, offset, pathToVehicle, pathToExit, vehiclePosition]);

    const handleWheel = (event: WheelEvent) => { event.preventDefault(); const scaleAmount = 1.1; setZoom(prevZoom => { const newZoom = event.deltaY < 0 ? prevZoom * scaleAmount : prevZoom / scaleAmount; return Math.max(0.3, Math.min(newZoom, 5)); }); };
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => { setIsDragging(true); setLastDragPosition({ x: event.clientX, y: event.clientY }); };
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => { if (!isDragging) return; const dx = event.clientX - lastDragPosition.x; const dy = event.clientY - lastDragPosition.y; setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); setLastDragPosition({ x: event.clientX, y: event.clientY }); };
    const handleMouseUp = () => setIsDragging(false);
    const getDistance = (touches: React.TouchList) => { return Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2)); };
    const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => { if (event.touches.length === 1) { setIsDragging(true); setLastDragPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY }); } else if (event.touches.length === 2) { setInitialPinchDistance(getDistance(event.touches)); } };
    const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => { event.preventDefault(); if (event.touches.length === 1 && isDragging) { const dx = event.touches[0].clientX - lastDragPosition.x; const dy = event.touches[0].clientY - lastDragPosition.y; setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); setLastDragPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY }); } else if (event.touches.length === 2 && initialPinchDistance) { const newDistance = getDistance(event.touches); const scaleFactor = newDistance / initialPinchDistance; const adjustedScaleFactor = 1 + (scaleFactor - 1) * ZOOM_SENSITIVITY; setZoom(prevZoom => Math.max(0.3, Math.min(prevZoom * adjustedScaleFactor, 5))); } };
    const handleTouchEnd = () => { setIsDragging(false); setInitialPinchDistance(null); };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
            return () => canvas.removeEventListener('wheel', handleWheel);
        }
    }, []);

    return (
        <Box sx={{ bgcolor: '#f7f7f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        {pageTitle}
                    </Typography>
                </Box>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.5, mx: 2, mt: 2, borderRadius: '12px', bgcolor: 'white' }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
                    <LegendItem color="#E53935" text="Đường đến xe" />
                    <LegendItem color="#FFC107" text="Đường ra" />
                    <LegendItem color="#1976d2" text="Vị trí xe" isBox />
                </Stack>
            </Paper>
            <Box sx={{ height: '55vh', p: 2, display: 'flex', position: 'relative' }}>
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
                {/* --- (UI) New Floating Action Button for TTS --- */}
                <Fab
                    color="primary"
                    aria-label="speak directions"
                    onClick={handleSpeak}
                    disabled={isSpeaking || pathToVehicle.length === 0}
                    sx={{ position: 'absolute', bottom: 32, right: 32 }}
                >
                    {isSpeaking ? <CircularProgress size={24} color="inherit" /> : <VolumeUpIcon />}
                </Fab>
            </Box>
        </Box>
    );
};

const LegendItem = ({ color, text, isBox = false }: { color: string; text: string; isBox?: boolean }) => (
    <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 20, height: isBox ? 20 : 5, bgcolor: color, borderRadius: isBox ? '4px' : '2px' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{text}</Typography>
    </Stack>
);

export default NavigateToSlotPage;