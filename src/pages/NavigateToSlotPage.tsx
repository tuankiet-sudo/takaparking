import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

// --- Configuration for the map ---
const NUM_ROWS = 12; // A to L
const NUM_COLS = 9;  // 1 to 9
const GRID_SIZE = 120;
const COLUMN_SIZE = 50;
// const MAP_WIDTH = (NUM_COLS + 1) * GRID_SIZE;
// const MAP_HEIGHT = (NUM_ROWS + 1) * GRID_SIZE;
const USER_POSITION = { x: 60, y: 60 };
const ZOOM_SENSITIVITY = 0.5; // THE CHANGE IS HERE: Lower is less sensitive. 1 is default.

// --- Pathfinding Implementation ---
class Node {
    x: number; y: number;
    constructor(x: number, y: number) { this.x = x; this.y = y; }
}

const findPathWithLimitedTurns = (startNode: Node, endNode: Node, grid: Node[][]): Node[] => {
    const path: Node[] = [];
    let currentX = startNode.x;
    let currentY = startNode.y;
    const endX = endNode.x;
    const endY = endNode.y;
    path.push(grid[currentX][currentY]);
    const pathType = Math.random() > 0.5 ? 'HVH' : 'VHV';
    if (pathType === 'HVH') {
        const intermediateX = Math.floor(Math.random() * (Math.abs(endX - currentX) + 1)) + Math.min(currentX, endX);
        while (currentX !== intermediateX) { currentX += Math.sign(intermediateX - currentX); path.push(grid[currentX][currentY]); }
        while (currentY !== endY) { currentY += Math.sign(endY - currentY); path.push(grid[currentX][currentY]); }
        while (currentX !== endX) { currentX += Math.sign(endX - currentX); path.push(grid[currentX][currentY]); }
    } else {
        const intermediateY = Math.floor(Math.random() * (Math.abs(endY - currentY) + 1)) + Math.min(currentY, endY);
        while (currentY !== intermediateY) { currentY += Math.sign(intermediateY - currentY); path.push(grid[currentX][currentY]); }
        while (currentX !== endX) { currentX += Math.sign(endX - currentX); path.push(grid[currentX][currentY]); }
        while (currentY !== endY) { currentY += Math.sign(endY - currentY); path.push(grid[currentX][currentY]); }
    }
    return path;
};


const NavigateToSlotPage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [zoom, setZoom] = useState(0.8);
    const [offset, setOffset] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);

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
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let y = 1; y <= NUM_ROWS; y++) {
            for (let x = 1; x <= NUM_COLS; x++) {
                const posX = x * GRID_SIZE;
                const posY = y * GRID_SIZE;
                const isVehicleColumn = posX === vehiclePosition.x && posY === vehiclePosition.y;
                ctx.fillStyle = isVehicleColumn ? '#1976d2' : '#e0e0e0';
                ctx.fillRect(posX, posY, COLUMN_SIZE, COLUMN_SIZE);
                const label = `${String.fromCharCode(64 + y)}${x}`;
                ctx.fillStyle = isVehicleColumn ? 'white' : 'black';
                ctx.fillText(label, posX + COLUMN_SIZE / 2, posY + COLUMN_SIZE / 2);
            }
        }
        if (path.length > 0) {
            ctx.beginPath();
            ctx.moveTo(USER_POSITION.x, USER_POSITION.y);
            for (const node of path) {
                ctx.lineTo(node.x * GRID_SIZE + GRID_SIZE / 2, node.y * GRID_SIZE + GRID_SIZE / 2);
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
        ctx.fillText('YOU', USER_POSITION.x, USER_POSITION.y);
        ctx.restore();
    };

    // --- Mouse Event Handlers ---
    const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        const scaleAmount = 1.1;
        setZoom(prevZoom => {
            const newZoom = event.deltaY < 0 ? prevZoom * scaleAmount : prevZoom / scaleAmount;
            return Math.max(0.3, Math.min(newZoom, 5));
        });
    };
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setLastDragPosition({ x: event.clientX, y: event.clientY });
    };
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        const dx = event.clientX - lastDragPosition.x;
        const dy = event.clientY - lastDragPosition.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastDragPosition({ x: event.clientX, y: event.clientY });
    };
    const handleMouseUp = () => setIsDragging(false);

    // --- Touch Event Handlers ---
    const getDistance = (touches: React.TouchList) => {
        return Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2));
    };

    const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
        if (event.touches.length === 1) {
            setIsDragging(true);
            setLastDragPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        } else if (event.touches.length === 2) {
            setInitialPinchDistance(getDistance(event.touches));
        }
    };

    const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (event.touches.length === 1 && isDragging) {
            const dx = event.touches[0].clientX - lastDragPosition.x;
            const dy = event.touches[0].clientY - lastDragPosition.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastDragPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        } else if (event.touches.length === 2 && initialPinchDistance) {
            const newDistance = getDistance(event.touches);
            const scaleFactor = newDistance / initialPinchDistance;
            
            // THE CHANGE IS HERE: Dampen the zoom effect using the sensitivity constant
            const adjustedScaleFactor = 1 + (scaleFactor - 1) * ZOOM_SENSITIVITY;

            setZoom(prevZoom => Math.max(0.3, Math.min(prevZoom * adjustedScaleFactor, 5)));
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setInitialPinchDistance(null);
    };

    // --- useEffect Hooks ---
    const [vehiclePosition, setVehiclePosition] = useState({ x: 0, y: 0 });
    const [path, setPath] = useState<Node[]>([]);
    useEffect(() => {
        const cols = NUM_COLS + 1;
        const rows = NUM_ROWS + 1;
        const grid: Node[][] = Array(cols).fill(null).map(() => Array(rows).fill(null));
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                grid[x][y] = new Node(x, y);
            }
        }
        const fixedXIndex = 3;
        const fixedYIndex = 8;
        setVehiclePosition({ x: fixedXIndex * GRID_SIZE, y: fixedYIndex * GRID_SIZE });
        const startNode = grid[0][0];
        const endNode = grid[fixedXIndex][fixedYIndex];
        const calculatedPath = findPathWithLimitedTurns(startNode, endNode, grid);
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
