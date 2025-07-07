import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, IconButton, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- Configuration for the map ---
const NUM_COLS = 12; // A to L
const NUM_ROWS = 9;  // 1 to 9
const GRID_SIZE = 150;
const COLUMN_SIZE = 50;
// const ZOOM_SENSITIVITY = 0.5;
const RUNWAY_SIZE = GRID_SIZE * 0.5;
const USER_START_COL = 3;
const USER_START_ROW = 2;
const USER_POSITION = { x: USER_START_COL * GRID_SIZE + 25, y: USER_START_ROW * GRID_SIZE + GRID_SIZE / 2 };
const EXIT_NODE_COORDINATES = { x: 11, y: 1 }; // Logical node for the exit near K1/L1

const elevators = [
    { name: "Thang máy Zone A", betweenCols: [3, 4], spansRows: [2, 4], orientation: 'vertical' },
    { name: "Thang máy Zone B", betweenRows: [5, 6], spansCols: [8, 10], orientation: 'horizontal' },
    { name: "Thang máy văn phòng", betweenRows: [1, 2], spansCols: [9, 11], orientation: 'horizontal' },
];

const CAR_PARKING_AREA = { startCol: 5, endCol: 8, startRow: 1, endRow: 4 };
const BOOKING_AREA = { startCol: 1, endCol: 12, startRow: 9, endRow: 9 };

// --- A* Pathfinding Implementation ---
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

// Helper to create a clean copy of the grid for pathfinding
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
    const [vehiclePosition, setVehiclePosition] = useState({ x: 0, y: 0 });
    const [pathToVehicle, setPathToVehicle] = useState<Node[]>([]);
    const [pathToExit, setPathToExit] = useState<Node[]>([]); // ADDED: State for exit path

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
        
        // --- Draw Areas, Columns, Entrance, Exit, Elevators (Largely unchanged) ---
        const carArea = CAR_PARKING_AREA;
        const carAreaRunwayXStart = carArea.startCol > 4 ? RUNWAY_SIZE : 0;
        const carAreaRunwayYStart = carArea.startRow > 4 ? RUNWAY_SIZE : 0;
        const carRectX = carArea.startCol * GRID_SIZE + carAreaRunwayXStart - (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectY = carArea.startRow * GRID_SIZE + carAreaRunwayYStart - (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectEndX = carArea.endCol * GRID_SIZE + (carArea.endCol > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
        const carRectEndY = carArea.endRow * GRID_SIZE + (carArea.endRow > 4 ? RUNWAY_SIZE : 0) + COLUMN_SIZE + (GRID_SIZE - COLUMN_SIZE) / 2;
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(carRectX, carRectY, carRectEndX - carRectX, carRectEndY - carRectY);
        ctx.fillStyle = '#f5f5f5';
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
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(bookingRectX, bookingRectY, bookingRectEndX - bookingRectX, bookingRectEndY - bookingRectY);
        
        ctx.fillStyle = '#f5f5f5';
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

        // --- Draw Path to Vehicle (Red) ---
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

        // --- ADDED: Draw Path to Exit (Yellow) ---
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
            ctx.strokeStyle = '#FFC107'; // Yellow color
            ctx.lineWidth = 5;
            ctx.setLineDash([10, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // --- Draw User Icon ---
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(USER_POSITION.x, USER_POSITION.y, COLUMN_SIZE / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('BẠN', USER_POSITION.x, USER_POSITION.y);
        ctx.restore();
    };

    // --- Event Handlers for Interactivity (Unchanged) ---
    const handleWheel = (event: WheelEvent) => { event.preventDefault(); const scaleAmount = 1.1; setZoom(prevZoom => { const newZoom = event.deltaY < 0 ? prevZoom * scaleAmount : prevZoom / scaleAmount; return Math.max(0.3, Math.min(newZoom, 5)); }); };
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => { setIsDragging(true); setLastDragPosition({ x: event.clientX, y: event.clientY }); };
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => { if (!isDragging) return; const dx = event.clientX - lastDragPosition.x; const dy = event.clientY - lastDragPosition.y; setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); setLastDragPosition({ x: event.clientX, y: event.clientY }); };
    const handleMouseUp = () => setIsDragging(false);
    
    // --- useEffect Hooks ---
    useEffect(() => {
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

        const fixedXIndex = 6; // Vehicle at column F
        const fixedYIndex = 8; // Vehicle at row 8
        
        const vehicleRunwayOffsetX = fixedXIndex > 4 ? RUNWAY_SIZE : 0;
        const vehicleRunwayOffsetY = fixedYIndex > 4 ? RUNWAY_SIZE : 0;
        setVehiclePosition({ x: fixedXIndex * GRID_SIZE + vehicleRunwayOffsetX, y: fixedYIndex * GRID_SIZE + vehicleRunwayOffsetY });
        
        // --- Calculate Path 1: User to Vehicle ---
        const gridForPath1 = deepCloneGrid(baseGrid);
        const startNode = gridForPath1[USER_START_COL - 1][USER_START_ROW];
        const vehicleNode = gridForPath1[fixedXIndex][fixedYIndex];
        startNode.isObstacle = false;
        vehicleNode.isObstacle = false;
        const calculatedPathToVehicle = findPath(startNode, vehicleNode, gridForPath1);
        setPathToVehicle(calculatedPathToVehicle);
        
        // --- Calculate Path 2: Vehicle to Exit ---
        const gridForPath2 = deepCloneGrid(baseGrid);
        const vehicleNodeForExit = gridForPath2[fixedXIndex][fixedYIndex];
        const exitNode = gridForPath2[EXIT_NODE_COORDINATES.x][EXIT_NODE_COORDINATES.y];
        vehicleNodeForExit.isObstacle = false;
        exitNode.isObstacle = false;
        const calculatedPathToExit = findPath(vehicleNodeForExit, exitNode, gridForPath2);
        setPathToExit(calculatedPathToExit);

    }, []);

    useEffect(() => {
        draw();
    }, [zoom, offset, pathToVehicle, pathToExit, vehiclePosition]);

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
                        Bản đồ bãi đỗ xe
                    </Typography>
                </Box>
            </Paper>

            {/* --- ADDED: Legend --- */}
            <Paper elevation={0} sx={{ p: 1.5, mx: 2, mt: 2, borderRadius: '12px', bgcolor: 'white' }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
                    <LegendItem color="#E53935" text="Đường đến xe" />
                    <LegendItem color="#FFC107" text="Đường ra" />
                    <LegendItem color="#1976d2" text="Vị trí xe" isBox />
                </Stack>
            </Paper>
            
            <Box sx={{ flex: 1, p: 2, display: 'flex' }}>
                <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}>
                    <canvas
                        ref={canvasRef}
                        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={(e) => { if (e.touches.length === 1) handleMouseDown(e as any); }}
                        onTouchMove={(e) => { if (e.touches.length === 1) handleMouseMove(e as any); }}
                        onTouchEnd={handleMouseUp}
                    />
                </Box>
            </Box>
        </Box>
    );
};

// Helper component for the legend
const LegendItem = ({ color, text, isBox = false }: { color: string; text: string; isBox?: boolean }) => (
    <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 20, height: isBox ? 20 : 5, bgcolor: color, borderRadius: isBox ? '4px' : '2px' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{text}</Typography>
    </Stack>
);

export default NavigateToSlotPage;
