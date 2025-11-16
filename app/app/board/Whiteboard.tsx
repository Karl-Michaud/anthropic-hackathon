"use client";

import { useRef, useState, useCallback, useEffect, MouseEvent } from "react";
import Cell, { CellData } from "./Cell";
import ZoomComponent from "./ZoomComponent";

const ZOOM_MIN = 0.3;
const ZOOM_MAX = 1.0;
const ZOOM_STEP = 0.1;

export default function Whiteboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);

  const [draggingCellId, setDraggingCellId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [cells, setCells] = useState<CellData[]>([]);

  const addNewCell = useCallback(() => {
    const colors = ["yellow", "blue", "pink", "green", "purple", "orange"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomRotation = Math.floor(Math.random() * 7) - 3; // -3 to 3 degrees

    // Calculate center of the viewport in canvas coordinates
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    // Convert viewport center to canvas coordinates (accounting for both pan offset AND zoom)
    // Cell is 192px (w-48), so offset by half to center it
    const cellWidth = 192;
    const cellHeight = 192;

    // Account for zoom: divide by zoom to get the correct canvas position
    const canvasCenterX = (viewportCenterX - position.x) / zoom - cellWidth / 2;
    const canvasCenterY = (viewportCenterY - position.y) / zoom - cellHeight / 2;

    const newCell: CellData = {
      id: `cell-${Date.now()}`,
      x: canvasCenterX,
      y: canvasCenterY,
      color: randomColor,
      text: "Double click to edit...",
      rotation: randomRotation,
    };

    setCells(prev => [...prev, newCell]);
  }, [position, zoom]);

  const handleCanvasMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    // Left-click to pan (only if not clicking on a cell)
    if (e.button === 0 && !draggingCellId) {
      setIsPanning(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position, draggingCellId]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isPanning && !draggingCellId) {
        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;
        setPosition({ x: newX, y: newY });
      }

      if (draggingCellId) {
        const newX = e.clientX - dragOffset.x - position.x;
        const newY = e.clientY - dragOffset.y - position.y;

        setCells(prev => prev.map(cell =>
          cell.id === draggingCellId
            ? { ...cell, x: newX, y: newY }
            : cell
        ));
      }
    },
    [isPanning, draggingCellId, startPos, dragOffset, position]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingCellId(null);
  }, []);

  const handleCellMouseDown = useCallback((e: MouseEvent<HTMLDivElement>, cellId: string, cellX: number, cellY: number) => {
    e.stopPropagation();
    setDraggingCellId(cellId);
    setDragOffset({
      x: e.clientX - position.x - cellX,
      y: e.clientY - position.y - cellY,
    });
  }, [position]);

  const handleTextChange = useCallback((cellId: string, newText: string) => {
    setCells(prev => prev.map(cell =>
      cell.id === cellId
        ? { ...cell, text: newText }
        : cell
    ));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom + ZOOM_STEP, ZOOM_MAX));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom - ZOOM_STEP, ZOOM_MIN));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    // Check for cmd (Mac) or ctrl (Windows/Linux)
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();

      // Determine zoom direction based on scroll direction
      const delta = e.deltaY;
      if (delta < 0) {
        // Scrolling up = zoom in
        setZoom(prevZoom => Math.min(prevZoom + ZOOM_STEP, ZOOM_MAX));
      } else if (delta > 0) {
        // Scrolling down = zoom out
        setZoom(prevZoom => Math.max(prevZoom - ZOOM_STEP, ZOOM_MIN));
      }
    }
  }, []);

  // Add wheel event listener for zoom control
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Calculate dot opacity based on zoom (fade out as we zoom out)
  const dotOpacity = zoom; // At 1.0 = full opacity, at 0.3 = 30% opacity
  const dotColor = `rgba(208, 201, 184, ${dotOpacity})`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-[#f5f3ed]"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        cursor: isPanning ? "grabbing" : "default",
      }}
    >
      {/* Add Cell Button */}
      <button
        onClick={addNewCell}
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95"
      >
        <span className="text-sm font-medium text-gray-700">+ Add Cell</span>
      </button>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-50">
        <ZoomComponent
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </div>

      {/* Panning canvas - infinite canvas that moves and scales */}
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          transition: "transform 0.2s ease-out",
          willChange: "transform",
        }}
      >
        {/* Render all cells */}
        {cells.map((cell) => (
          <Cell
            key={cell.id}
            cell={cell}
            isDragging={draggingCellId === cell.id}
            onMouseDown={handleCellMouseDown}
            onTextChange={handleTextChange}
          />
        ))}
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200 pointer-events-none z-50">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Click + Drag</span> background to pan • <span className="font-semibold">Click + Drag</span> cells to move them
        </p>
      </div>
    </div>
  );
}
