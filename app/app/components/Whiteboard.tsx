'use client'

import { useRef, useState, useCallback, useEffect, MouseEvent } from 'react'
import Cell, { CellData } from './Cell'
import ZoomComponent from './ZoomComponent'
import DraggableToolbar from './DraggableToolbar'
import DraggableBlock from './DraggableBlock'
import ScholarshipWithActions from './scholarship/ScholarshipWithActions'
import EssayBlock from './essay/EssayBlock'
import JsonOutputBlock from './scholarship/JsonOutputBlock'
import { useWhiteboard } from '../context/WhiteboardContext'
import { useEditing } from '../context/EditingContext'

const ZOOM_MIN = 0.3
const ZOOM_MAX = 1.0
const ZOOM_STEP = 0.1

interface BlockPosition {
  id: string
  x: number
  y: number
}

export default function Whiteboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.0)

  const [draggingCellId, setDraggingCellId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const [cells, setCells] = useState<CellData[]>([])

  // Block positions (scholarships and essays)
  const [blockPositions, setBlockPositions] = useState<BlockPosition[]>([])
  const [generatingEssayFor, setGeneratingEssayFor] = useState<string | null>(null)

  const { scholarships, essays, jsonOutputs, updateScholarship, deleteScholarship, addEssay, updateEssay, deleteEssay } = useWhiteboard()
  const { isEditing } = useEditing()

  // Initialize positions for new scholarships
  useEffect(() => {
    scholarships.forEach((scholarship) => {
      if (!blockPositions.find((p) => p.id === scholarship.id)) {
        const viewportCenterX = window.innerWidth / 2
        const viewportCenterY = window.innerHeight / 2
        const canvasX = (viewportCenterX - position.x) / zoom - 275
        const canvasY = (viewportCenterY - position.y) / zoom - 200

        setBlockPositions((prev) => [
          ...prev,
          { id: scholarship.id, x: canvasX, y: canvasY },
        ])
      }
    })
  }, [scholarships, blockPositions, position, zoom])

  // Initialize positions for new essays
  useEffect(() => {
    essays.forEach((essay) => {
      if (!blockPositions.find((p) => p.id === essay.id)) {
        const viewportCenterX = window.innerWidth / 2
        const viewportCenterY = window.innerHeight / 2
        const canvasX = (viewportCenterX - position.x) / zoom - 250 + Math.random() * 100
        const canvasY = (viewportCenterY - position.y) / zoom - 150 + Math.random() * 100

        setBlockPositions((prev) => [
          ...prev,
          { id: essay.id, x: canvasX, y: canvasY },
        ])
      }
    })
  }, [essays, blockPositions, position, zoom])

  // Initialize positions for new JSON outputs (placed to the right of scholarship)
  useEffect(() => {
    jsonOutputs.forEach((jsonOutput) => {
      if (!blockPositions.find((p) => p.id === jsonOutput.id)) {
        const scholarshipPos = blockPositions.find((p) => p.id === jsonOutput.scholarshipId)
        const canvasX = scholarshipPos ? scholarshipPos.x + 580 : 700
        const canvasY = scholarshipPos ? scholarshipPos.y : 100

        setBlockPositions((prev) => [
          ...prev,
          { id: jsonOutput.id, x: canvasX, y: canvasY },
        ])
      }
    })
  }, [jsonOutputs, blockPositions])

  const getBlockPosition = useCallback(
    (id: string) => blockPositions.find((p) => p.id === id) || { id, x: 100, y: 100 },
    [blockPositions]
  )

  const handleBlockMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>, blockId: string, blockX: number, blockY: number) => {
      e.stopPropagation()
      setDraggingCellId(blockId)
      setDragOffset({
        x: e.clientX - position.x - blockX * zoom,
        y: e.clientY - position.y - blockY * zoom,
      })
    },
    [position, zoom]
  )

  const handleCreateDraft = useCallback(
    (scholarshipId: string) => {
      const scholarship = scholarships.find((s) => s.id === scholarshipId)
      if (!scholarship) return

      addEssay({
        scholarshipId,
        content: '',
        maxWordCount: undefined,
      })
    },
    [scholarships, addEssay]
  )

  const handleGenerateEssay = useCallback(
    async (scholarshipId: string) => {
      const scholarship = scholarships.find((s) => s.id === scholarshipId)
      if (!scholarship) return

      setGeneratingEssayFor(scholarshipId)

      try {
        const response = await fetch('/api/generate-essay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scholarshipTitle: scholarship.title,
            scholarshipDescription: scholarship.description,
            essayPrompt: scholarship.prompt,
          }),
        })

        const result = await response.json()

        if (result.success && result.data) {
          addEssay({
            scholarshipId,
            content: result.data.content,
            maxWordCount: undefined,
          })
        }
      } catch (error) {
        console.error('Failed to generate essay:', error)
      } finally {
        setGeneratingEssayFor(null)
      }
    },
    [scholarships, addEssay]
  )

  const addNewCell = useCallback(() => {
    const colors = ['yellow', 'blue', 'pink', 'green', 'purple', 'orange']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const randomRotation = Math.floor(Math.random() * 7) - 3 // -3 to 3 degrees

    // Calculate center of the viewport in canvas coordinates
    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2

    // Convert viewport center to canvas coordinates (accounting for both pan offset AND zoom)
    // Cell is 192px (w-48), so offset by half to center it
    const cellWidth = 192
    const cellHeight = 192

    // Account for zoom: divide by zoom to get the correct canvas position
    const canvasCenterX = (viewportCenterX - position.x) / zoom - cellWidth / 2
    const canvasCenterY = (viewportCenterY - position.y) / zoom - cellHeight / 2

    const newCell: CellData = {
      id: `cell-${Date.now()}`,
      x: canvasCenterX,
      y: canvasCenterY,
      color: randomColor,
      text: 'Double click to edit...',
      rotation: randomRotation,
    }

    setCells((prev) => [...prev, newCell])
  }, [position, zoom])

  const handleCanvasMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // Don't pan if editing text
      if (isEditing) return

      // Left-click to pan (only if not clicking on a cell)
      if (e.button === 0 && !draggingCellId) {
        setIsPanning(true)
        setStartPos({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        })
      }
    },
    [position, draggingCellId, isEditing],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isPanning && !draggingCellId) {
        const newX = e.clientX - startPos.x
        const newY = e.clientY - startPos.y
        setPosition({ x: newX, y: newY })
      }

      if (draggingCellId) {
        // Divide by zoom to account for the scaled canvas
        const newX = (e.clientX - dragOffset.x - position.x) / zoom
        const newY = (e.clientY - dragOffset.y - position.y) / zoom

        // Check if it's a cell
        if (draggingCellId.startsWith('cell-')) {
          setCells((prev) =>
            prev.map((cell) =>
              cell.id === draggingCellId ? { ...cell, x: newX, y: newY } : cell,
            ),
          )
        } else {
          // It's a scholarship or essay block
          setBlockPositions((prev) =>
            prev.map((p) =>
              p.id === draggingCellId ? { ...p, x: newX, y: newY } : p,
            ),
          )
        }
      }
    },
    [isPanning, draggingCellId, startPos, dragOffset, position, zoom],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setDraggingCellId(null)
  }, [])

  const handleCellMouseDown = useCallback(
    (
      e: MouseEvent<HTMLDivElement>,
      cellId: string,
      cellX: number,
      cellY: number,
    ) => {
      e.stopPropagation()
      setDraggingCellId(cellId)
      // Account for zoom: cellX/Y are in canvas coordinates, need to scale to screen
      setDragOffset({
        x: e.clientX - position.x - cellX * zoom,
        y: e.clientY - position.y - cellY * zoom,
      })
    },
    [position, zoom],
  )

  const handleTextChange = useCallback((cellId: string, newText: string) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === cellId ? { ...cell, text: newText } : cell,
      ),
    )
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom + ZOOM_STEP, ZOOM_MAX))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom - ZOOM_STEP, ZOOM_MIN))
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    // Check for cmd (Mac) or ctrl (Windows/Linux)
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault()

      // Determine zoom direction based on scroll direction
      const delta = e.deltaY
      if (delta < 0) {
        // Scrolling up = zoom in
        setZoom((prevZoom) => Math.min(prevZoom + ZOOM_STEP, ZOOM_MAX))
      } else if (delta > 0) {
        // Scrolling down = zoom out
        setZoom((prevZoom) => Math.max(prevZoom - ZOOM_STEP, ZOOM_MIN))
      }
    }
  }, [])

  // Add wheel event listener for zoom control
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Calculate dot opacity based on zoom (fade out as we zoom out)
  const dotOpacity = zoom // At 1.0 = full opacity, at 0.3 = 30% opacity
  const dotColor = `rgba(208, 201, 184, ${dotOpacity})`

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
        cursor: isPanning ? 'grabbing' : 'default',
      }}
    >
      {/* Draggable Toolbar */}
      <DraggableToolbar onAddCell={addNewCell} />

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
          transformOrigin: '0 0',
          transition: 'transform 0.2s ease-out',
          willChange: 'transform',
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

        {/* Render scholarship blocks */}
        {scholarships.map((scholarship) => {
          const pos = getBlockPosition(scholarship.id)
          return (
            <DraggableBlock
              key={scholarship.id}
              id={scholarship.id}
              x={pos.x}
              y={pos.y}
              isDragging={draggingCellId === scholarship.id}
              onMouseDown={handleBlockMouseDown}
            >
              <ScholarshipWithActions
                data={scholarship}
                onUpdate={updateScholarship}
                onDelete={deleteScholarship}
                onCreateDraft={handleCreateDraft}
              />
            </DraggableBlock>
          )
        })}

        {/* Render essay blocks */}
        {essays.map((essay) => {
          const pos = getBlockPosition(essay.id)
          const scholarship = scholarships.find((s) => s.id === essay.scholarshipId)
          return (
            <DraggableBlock
              key={essay.id}
              id={essay.id}
              x={pos.x}
              y={pos.y}
              isDragging={draggingCellId === essay.id}
              onMouseDown={handleBlockMouseDown}
            >
              <EssayBlock
                data={essay}
                scholarshipTitle={scholarship?.title}
                onUpdate={updateEssay}
                onDelete={deleteEssay}
                isGenerating={generatingEssayFor === essay.scholarshipId}
              />
            </DraggableBlock>
          )
        })}

        {/* Render JSON output blocks */}
        {jsonOutputs.map((jsonOutput) => {
          const pos = getBlockPosition(jsonOutput.id)
          return (
            <DraggableBlock
              key={jsonOutput.id}
              id={jsonOutput.id}
              x={pos.x}
              y={pos.y}
              isDragging={draggingCellId === jsonOutput.id}
              onMouseDown={handleBlockMouseDown}
            >
              <JsonOutputBlock data={jsonOutput.data} />
            </DraggableBlock>
          )
        })}
      </div>

    </div>
  )
}
