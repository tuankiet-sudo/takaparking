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

// --- Pathfinding Implementation with Limited Turns ---
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

    // Randomly choose between a Horizontal-Vertical-Horizontal or Vertical-Horizontal-Vertical path shape
    const pathType = Math.random() > 0.5 ? 'HVH' : 'VHV';

    if (pathType === 'HVH') {
        // Find a random horizontal turning point
        const intermediateX = Math.floor(Math.random() * (Math.abs(endX - currentX) + 1)) + Math.min(currentX, endX);

        // 1. Move horizontally to the turning point
        while (currentX !== intermediateX) {
            currentX += Math.sign(intermediateX - currentX);
            path.push(grid[currentX][currentY]);
        }
        // 2. Move vertically all the way to the target's row
        while (currentY !== endY) {
            currentY += Math.sign(endY - currentY);
            path.push(grid[currentX][currentY]);
        }
        // 3. Move horizontally to the final destination
        while (currentX !== endX) {
            currentX += Math.sign(endX - currentX);
            path.push(grid[currentX][currentY]);
        }
    } else { // VHV Path
        // Find a random vertical turning point
        const intermediateY = Math.floor(Math.random() * (Math.abs(endY - currentY) + 1)) + Math.min(currentY, endY);

        // 1. Move vertically to the turning point
        while (currentY !== intermediateY) {
            currentY += Math.sign(intermediateY - currentY);
            path.push(grid[currentX][currentY]);
        }
        // 2. Move horizontally all the way to the target's column
        while (currentX !== endX) {
            currentX += Math.sign(endX - currentX);
            path.push(grid[currentX][currentY]);
        }
        // 3. Move vertically to the final destination
        while (currentY !== endY) {
            currentY += Math.sign(endY - currentY);
            path.push(grid[currentX][currentY]);
        }
    }

    return path;
};


const NavigateToSlotPage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [zoom, setZoom] = useState(0.8);
    const [offset, setOffset] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });
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

        // Draw Columns with Labels
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
        
        // Draw the Path
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

        // Draw user marker
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(USER_POSITION.x, USER_POSITION.y, COLUMN_SIZE / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('YOU', USER_POSITION.x, USER_POSITION.y);

        ctx.restore();
    };

    // Event Handlers for Interactivity
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

    // useEffect Hooks
    useEffect(() => {
        const cols = NUM_COLS + 1;
        const rows = NUM_ROWS + 1;
        const grid: Node[][] = Array(cols).fill(null).map(() => Array(rows).fill(null));

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                grid[x][y] = new Node(x, y);
            }
        }

        const fixedXIndex = 3; // Column 3
        const fixedYIndex = 8; // Row H (A=1, B=2, ..., H=8)
        
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
                Bản đồ bãi đỗ xe - Tầng Hầm B3
            </Typography>
            <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}>
                <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </Box>
        </Box>
    );
};

export default NavigateToSlotPage;
