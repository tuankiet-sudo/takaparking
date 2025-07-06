// src/pages/NavigateToSlotPage.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

// --- Configuration for the map ---
const NUM_COLS = 12; // A to L are columns
const NUM_ROWS = 9;  // 1 to 9 are rows
const GRID_SIZE = 150;
const COLUMN_SIZE = 50;
const ZOOM_SENSITIVITY = 0.5;
const RUNWAY_SIZE = GRID_SIZE * 0.5;
const USER_START_COL = 3;
const USER_START_ROW = 2;
const USER_POSITION = {
    x: USER_START_COL * GRID_SIZE + 25,
    y: USER_START_ROW * GRID_SIZE + GRID_SIZE / 2
};

const elevators = [
    { name: "Thang máy Zone A", betweenCols: [3, 4], spansRows: [2, 4], orientation: 'vertical' },
    { name: "Thang máy Zone B", betweenRows: [5, 6], spansCols: [8, 10], orientation: 'horizontal' },
    { name: "Thang máy văn phòng", betweenRows: [1, 2], spansCols: [9, 11], orientation: 'horizontal' },
];

const CAR_PARKING_AREA = {
    startCol: 5, endCol: 8, startRow: 1, endRow: 4,
};

// --- A* Pathfinding Implementation ---
class Node {
    x: number; y: number; isObstacle: boolean; g: number = 0; h: number = 0; f: number = 0; parent: Node | null = null;
    constructor(x: number, y: number, isObstacle = false) {
        this.x = x; this.y = y; this.isObstacle = isObstacle;
    }
}

const findPath = (startNode: Node, endNode: Node, grid: Node[][]): Node[] => {
    const openList: Node[] = [startNode];
    const closedList: Node[] = [];
    while (openList.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowestIndex].f) lowestIndex = i;
        }
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
            if (closedList.some(n => n.x === neighbor.x && n.y === neighbor.y) || neighbor.isObstacle) {
                continue;
            }
            const gScore = currentNode.g + 1;
            let gScoreIsBest = false;
            if (!openList.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                gScoreIsBest = true;
                neighbor.h = Math.abs(neighbor.x - endNode.x) + Math.abs(neighbor.y - endNode.y) + Math.random();
                openList.push(neighbor);
            } else if (gScore < neighbor.g) {
                gScoreIsBest = true;
            }
            if (gScoreIsBest) {
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }
    return []; // No path found
};


const NavigateToSlotPage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [zoom, setZoom] = useState(0.7);
    const [offset, setOffset] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const [vehiclePosition, setVehiclePosition] = useState({ x: 0, y: 0 });
    const [path, setPath] = useState<Node[]>([]);

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
        
        // Draw Defined Areas
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

        // Draw Columns
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
        
        // Draw Elevators
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
            ctx.fillStyle = 'black';
            ctx.save();
            ctx.translate(centerX, centerY);
            if (elevator.orientation === 'vertical') ctx.rotate(-Math.PI / 2);
            ctx.fillText(elevator.name, 0, 0);
            ctx.restore();
        });

        if (path.length > 0) {
            ctx.beginPath();
            ctx.moveTo(USER_POSITION.x, USER_POSITION.y);
            for (const node of path) {
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

    // --- Event Handlers for Interactivity (No changes needed) ---
    const handleWheel = (event: WheelEvent) => { event.preventDefault(); const scaleAmount = 1.1; setZoom(prevZoom => { const newZoom = event.deltaY < 0 ? prevZoom * scaleAmount : prevZoom / scaleAmount; return Math.max(0.3, Math.min(newZoom, 5)); }); };
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => { setIsDragging(true); setLastDragPosition({ x: event.clientX, y: event.clientY }); };
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => { if (!isDragging) return; const dx = event.clientX - lastDragPosition.x; const dy = event.clientY - lastDragPosition.y; setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); setLastDragPosition({ x: event.clientX, y: event.clientY }); };
    const handleMouseUp = () => setIsDragging(false);
    const getDistance = (touches: React.TouchList) => { return Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2)); };
    const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => { if (event.touches.length === 1) { setIsDragging(true); setLastDragPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY }); } else if (event.touches.length === 2) { setInitialPinchDistance(getDistance(event.touches)); } };
    const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => { event.preventDefault(); if (event.touches.length === 1 && isDragging) { const dx = event.touches[0].clientX - lastDragPosition.x; const dy = event.touches[0].clientY - lastDragPosition.y; setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); setLastDragPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY }); } else if (event.touches.length === 2 && initialPinchDistance) { const newDistance = getDistance(event.touches); const scaleFactor = newDistance / initialPinchDistance; const adjustedScaleFactor = 1 + (scaleFactor - 1) * ZOOM_SENSITIVITY; setZoom(prevZoom => Math.max(0.3, Math.min(prevZoom * adjustedScaleFactor, 5))); } };
    const handleTouchEnd = () => { setIsDragging(false); setInitialPinchDistance(null); };

    // --- useEffect Hooks ---
    useEffect(() => {
        const cols = NUM_COLS + 1;
        const rows = NUM_ROWS + 1;
        const grid: Node[][] = Array(cols).fill(null).map(() => Array(rows).fill(null));

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                grid[x][y] = new Node(x, y, false);
            }
        }
        
        elevators.forEach(elevator => {
            if (elevator.orientation === 'vertical') {
                const col = elevator.betweenCols![0];
                for (let row = elevator.spansRows![0]; row <= elevator.spansRows![1]; row++) {
                    if(grid[col]?.[row]) grid[col][row].isObstacle = true;
                }
            } else {
                const row = elevator.betweenRows![0];
                for (let col = elevator.spansCols![0]; col <= elevator.spansCols![1]; col++) {
                    if(grid[col]?.[row]) grid[col][row].isObstacle = true;
                }
            }
        });

        const fixedXIndex = 6;
        const fixedYIndex = 8;
        
        const vehicleRunwayOffsetX = fixedXIndex > 4 ? RUNWAY_SIZE : 0;
        const vehicleRunwayOffsetY = fixedYIndex > 4 ? RUNWAY_SIZE : 0;
        setVehiclePosition({ 
            x: fixedXIndex * GRID_SIZE + vehicleRunwayOffsetX, 
            y: fixedYIndex * GRID_SIZE + vehicleRunwayOffsetY 
        });
        
        // ** THE FIX IS HERE: Start the path from a known walkable node **
        // The user's visual icon is in the aisle between C2 and C3.
        // The path will start from the safe aisle intersection at C2.
        const startNode = grid[USER_START_COL-1][USER_START_ROW];
        const endNode = grid[fixedXIndex][fixedYIndex];
        
        startNode.isObstacle = false;
        endNode.isObstacle = false;
        
        const calculatedPath = findPath(startNode, endNode, grid);
        setPath(calculatedPath);
    }, []);

    useEffect(() => {
        draw();
    }, [zoom, offset, path, vehiclePosition]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
            return () => canvas.removeEventListener('wheel', handleWheel);
        }
    }, [zoom]);

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                Tìm đường đến xe
            </Typography>
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

export default NavigateToSlotPage;
