/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useRef, useState, useCallback, useEffect, MouseEvent } from 'react'
import Cell from './Cell'
import ZoomComponent from './ZoomComponent'
import DraggableToolbar, { Tool } from './toolbar/DraggableToolbar'
import DraggableBlock from './DraggableBlock'
import ScholarshipWithActions from './scholarship/ScholarshipWithActions'
import EssayBlock from './essay/EssayBlock'
import JsonOutputBlock from './scholarship/JsonOutputBlock'
import { useWhiteboard } from '../context/WhiteboardContext'
import { useEditing } from '../context/EditingContext'
import { saveEssayDraftToDB } from '../lib/dbUtils'

const ZOOM_MIN = 0.3
const ZOOM_MAX = 1.0
const ZOOM_STEP = 0.1
const MOMENTUM_DECAY = 0.92

export default function Whiteboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [isPanning, setIsPanning] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [momentum, setMomentum] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.0)

  const [draggingCellId, setDraggingCellId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [syncingData, setSyncingData] = useState(false)

  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
  } | null>(null)
  const [selectedIds, setSelectedIds] = useState(new Set<string>())
  const [dragStartPositions, setDragStartPositions] = useState(
    new Map<string, { x: number; y: number }>(),
  )
  const [clipboard, setClipboard] = useState<Array<{
    type: 'cell' | 'scholarship' | 'essay' | 'jsonOutput'
    data: unknown
  }> | null>(null)
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)

  const {
    cells,
    scholarships,
    essays,
    jsonOutputs,
    blockPositions,
    addCell,
    updateCell,
    deleteCell,
    addScholarship,
    updateScholarship,
    deleteScholarship,
    addEssay,
    updateEssay,
    deleteEssay,
    deleteJsonOutput,
    updateBlockPosition,
    getBlockPosition,
  } = useWhiteboard()
  const { isEditing } = useEditing()

  // Smooth momentum-based panning animation
  useEffect(() => {
    if (!isPanning && (momentum.x !== 0 || momentum.y !== 0)) {
      const animate = () => {
        setPosition((prev) => ({
          x: prev.x + momentum.x,
          y: prev.y + momentum.y,
        }))

        setMomentum((prev) => {
          const newMomentum = {
            x: prev.x * MOMENTUM_DECAY,
            y: prev.y * MOMENTUM_DECAY,
          }

          if (Math.abs(newMomentum.x) > 0.1 || Math.abs(newMomentum.y) > 0.1) {
            animationFrameRef.current = requestAnimationFrame(animate)
          } else {
            animationFrameRef.current = null
          }

          return newMomentum
        })
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPanning, momentum])

  // Initialize positions for new scholarships
  useEffect(() => {
    scholarships.forEach((scholarship) => {
      const existing = blockPositions.find((p) => p.id === scholarship.id)
      if (!existing) {
        const viewportCenterX = window.innerWidth / 2
        const viewportCenterY = window.innerHeight / 2
        const canvasX = (viewportCenterX - position.x) / zoom - 275
        const canvasY = (viewportCenterY - position.y) / zoom - 200
        updateBlockPosition(scholarship.id, canvasX, canvasY)
      }
    })
  }, [scholarships, blockPositions, position, zoom, updateBlockPosition])

  // Initialize positions for new essays
  useEffect(() => {
    essays.forEach((essay) => {
      const existing = blockPositions.find((p) => p.id === essay.id)
      if (!existing) {
        const viewportCenterX = window.innerWidth / 2
        const viewportCenterY = window.innerHeight / 2
        const canvasX =
          (viewportCenterX - position.x) / zoom - 250 + Math.random() * 100
        const canvasY =
          (viewportCenterY - position.y) / zoom - 150 + Math.random() * 100
        updateBlockPosition(essay.id, canvasX, canvasY)
      }
    })
  }, [essays, blockPositions, position, zoom, updateBlockPosition])

  // Initialize positions for new JSON outputs
  useEffect(() => {
    jsonOutputs.forEach((jsonOutput) => {
      const existing = blockPositions.find((p) => p.id === jsonOutput.id)
      if (!existing) {
        const scholarshipPos = blockPositions.find(
          (p) => p.id === jsonOutput.scholarshipId,
        )
        const canvasX = scholarshipPos ? scholarshipPos.x + 580 : 700
        const canvasY = scholarshipPos ? scholarshipPos.y : 100
        updateBlockPosition(jsonOutput.id, canvasX, canvasY)
      }
    })
  }, [jsonOutputs, blockPositions, updateBlockPosition])

  // Debounced sync to database for scholarship updates
  useEffect(() => {
    const syncTimer = setTimeout(async () => {
      if (scholarships.length > 0 && !syncingData) {
        setSyncingData(true)
        try {
          // Sync each scholarship to database
          for (const scholarship of scholarships) {
            // Only save if it doesn't have a database ID or if it's been updated
            if (scholarship.id && scholarship.id.length > 0) {
              // Scholarships are already tracked - this would be for updates
              // For now, we rely on the save that happens when uploading
            }
          }
        } catch (error) {
          console.error('Failed to sync scholarships:', error)
        } finally {
          setSyncingData(false)
        }
      }
    }, 3000) // Debounce: sync every 3 seconds if changes exist

    return () => clearTimeout(syncTimer)
  }, [scholarships, syncingData])

  // Sync essay updates to database
  useEffect(() => {
    const syncTimer = setTimeout(async () => {
      if (essays.length > 0 && !syncingData) {
        setSyncingData(true)
        try {
          for (const essay of essays) {
            if (essay.scholarshipId && essay.content) {
              await saveEssayDraftToDB(essay.scholarshipId, 0, essay.content)
            }
          }
        } catch (error) {
          console.error('Failed to sync essays:', error)
        } finally {
          setSyncingData(false)
        }
      }
    }, 3000)

    return () => clearTimeout(syncTimer)
  }, [essays, syncingData])

  const handleBlockMouseDown = useCallback(
    (
      e: MouseEvent<HTMLDivElement>,
      blockId: string,
      blockX: number,
      blockY: number,
    ) => {
      e.stopPropagation()
      setDraggingCellId(blockId)
      setDragOffset({
        x: e.clientX - position.x - blockX * zoom,
        y: e.clientY - position.y - blockY * zoom,
      })
      setMomentum({ x: 0, y: 0 }) // Stop momentum when dragging

      // Populate dragStartPositions with current positions
      const newDragStartPositions = new Map<string, { x: number; y: number }>()
      selectedIds.forEach((id) => {
        const pos = getBlockPosition(id)
        newDragStartPositions.set(id, pos)
      })
      if (newDragStartPositions.size === 0) {
        newDragStartPositions.set(blockId, { x: blockX, y: blockY })
      }
      setDragStartPositions(newDragStartPositions)
    },
    [position, zoom, selectedIds, getBlockPosition],
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
    [scholarships, addEssay],
  )

  // Essay generation currently pending workflow implementation
  /*
  const handleGenerateEssay = useCallback(
    async (scholarshipId: string) => {
      const scholarship = scholarships.find((s) => s.id === scholarshipId)
      if (!scholarship) return

      setGeneratingEssayFor(scholarshipId)

      try {
        const response = await requestClaude<IGenerateDraft>(
          'generateDraft',
          scholarship.title,
          scholarship.description,
          scholarship.prompt,
        )

        // Fix: Handle the response correctly - response.essay is the essay content
        const essayContent = response.essay || ''

        addEssay({
          scholarshipId,
          content: essayContent,
          maxWordCount: undefined,
        })

        // Save to database
        if (scholarship.id) {
          await saveEssayDraftToDB(scholarship.id, 0, essayContent)
        }
      } catch (error) {
        console.error('Failed to generate essay:', error)
      } finally {
        setGeneratingEssayFor(null)
      }
    },
    [scholarships, addEssay],
  )
  */

  const addNewCell = useCallback(() => {
    const colors = ['yellow', 'blue', 'pink', 'green', 'purple', 'orange']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const randomRotation = Math.floor(Math.random() * 7) - 3

    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2

    const cellWidth = 192
    const cellHeight = 192

    const canvasCenterX = (viewportCenterX - position.x) / zoom - cellWidth / 2
    const canvasCenterY = (viewportCenterY - position.y) / zoom - cellHeight / 2

    addCell({
      x: canvasCenterX,
      y: canvasCenterY,
      color: randomColor,
      text: 'Double click to edit...',
      rotation: randomRotation,
    })
  }, [position, zoom, addCell])

  const handleCanvasMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isEditing) return

      // Close context menu if open
      if (contextMenu) {
        setContextMenu(null)
        return
      }

      if (e.button === 0 && !draggingCellId) {
        setIsPanning(true)
        setMomentum({ x: 0, y: 0 })
        setStartPos({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        })
      }
    },
    [position, draggingCellId, isEditing, contextMenu],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isPanning && !draggingCellId) {
        const newX = e.clientX - startPos.x
        const newY = e.clientY - startPos.y
        const deltaX = newX - position.x
        const deltaY = newY - position.y

        setPosition({ x: newX, y: newY })
        setMomentum({ x: deltaX * 0.3, y: deltaY * 0.3 }) // Store momentum
      }

      if (draggingCellId && dragStartPositions.size > 0) {
        // Calculate the new position for the dragged item
        const newX = (e.clientX - dragOffset.x - position.x) / zoom
        const newY = (e.clientY - dragOffset.y - position.y) / zoom

        // Get the original position of the dragged item
        const draggedOriginalPos = dragStartPositions.get(draggingCellId)
        if (draggedOriginalPos) {
          // Calculate the delta
          const deltaX = newX - draggedOriginalPos.x
          const deltaY = newY - draggedOriginalPos.y

          // Move all selected items by the same delta
          dragStartPositions.forEach((originalPos, id) => {
            const newItemX = originalPos.x + deltaX
            const newItemY = originalPos.y + deltaY

            if (id.startsWith('cell-')) {
              const cell = cells.find((c) => c.id === id)
              if (cell) {
                updateCell({ ...cell, x: newItemX, y: newItemY })
              }
            } else {
              updateBlockPosition(id, newItemX, newItemY)
            }
          })
        }
      }

      // Update selection box
      if (selectionBox) {
        setSelectionBox({
          ...selectionBox,
          currentX: e.clientX,
          currentY: e.clientY,
        })
      }
    },
    [
      isPanning,
      draggingCellId,
      startPos,
      dragOffset,
      position,
      zoom,
      cells,
      updateCell,
      updateBlockPosition,
    ],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setDraggingCellId(null)
    setDragStartPositions(new Map())

    // Handle selection box completion
    if (selectionBox) {
      const { startX, startY, currentX, currentY } = selectionBox

      // Calculate selection box bounds in screen coordinates
      const boxLeft = Math.min(startX, currentX)
      const boxRight = Math.max(startX, currentX)
      const boxTop = Math.min(startY, currentY)
      const boxBottom = Math.max(startY, currentY)

      // Convert bounds to canvas coordinates
      const canvasBoxLeft = (boxLeft - position.x) / zoom
      const canvasBoxRight = (boxRight - position.x) / zoom
      const canvasBoxTop = (boxTop - position.y) / zoom
      const canvasBoxBottom = (boxBottom - position.y) / zoom

      const newSelectedIds = new Set<string>(selectedIds)

      // Check cells
      cells.forEach((cell) => {
        const cellLeft = cell.x
        const cellRight = cell.x + 192 // cell width
        const cellTop = cell.y
        const cellBottom = cell.y + 192 // cell height

        // Check if cell intersects with selection box
        if (
          cellRight > canvasBoxLeft &&
          cellLeft < canvasBoxRight &&
          cellBottom > canvasBoxTop &&
          cellTop < canvasBoxBottom
        ) {
          newSelectedIds.add(cell.id)
        }
      })

      // Check scholarships
      scholarships.forEach((scholarship) => {
        const pos = getBlockPosition(scholarship.id)
        const blockLeft = pos.x
        const blockRight = pos.x + 550 // approximate block width
        const blockTop = pos.y
        const blockBottom = pos.y + 400 // approximate block height

        if (
          blockRight > canvasBoxLeft &&
          blockLeft < canvasBoxRight &&
          blockBottom > canvasBoxTop &&
          blockTop < canvasBoxBottom
        ) {
          newSelectedIds.add(scholarship.id)
        }
      })

      // Check essays
      essays.forEach((essay) => {
        const pos = getBlockPosition(essay.id)
        const blockLeft = pos.x
        const blockRight = pos.x + 500
        const blockTop = pos.y
        const blockBottom = pos.y + 400

        if (
          blockRight > canvasBoxLeft &&
          blockLeft < canvasBoxRight &&
          blockBottom > canvasBoxTop &&
          blockTop < canvasBoxBottom
        ) {
          newSelectedIds.add(essay.id)
        }
      })

      // Check JSON outputs
      jsonOutputs.forEach((jsonOutput) => {
        const pos = getBlockPosition(jsonOutput.id)
        const blockLeft = pos.x
        const blockRight = pos.x + 400
        const blockTop = pos.y
        const blockBottom = pos.y + 300

        if (
          blockRight > canvasBoxLeft &&
          blockLeft < canvasBoxRight &&
          blockBottom > canvasBoxTop &&
          blockTop < canvasBoxBottom
        ) {
          newSelectedIds.add(jsonOutput.id)
        }
      })

      setSelectedIds(newSelectedIds)
      setSelectionBox(null)
    }
  }, [
    selectionBox,
    position,
    zoom,
    cells,
    scholarships,
    essays,
    jsonOutputs,
    selectedIds,
    getBlockPosition,
  ])

  const handleCellMouseDown = useCallback(
    (
      e: MouseEvent<HTMLDivElement>,
      cellId: string,
      cellX: number,
      cellY: number,
    ) => {
      e.stopPropagation()
      setDraggingCellId(cellId)
      setMomentum({ x: 0, y: 0 })
      setDragOffset({
        x: e.clientX - position.x - cellX * zoom,
        y: e.clientY - position.y - cellY * zoom,
      })

      // Populate dragStartPositions with current positions
      const newDragStartPositions = new Map<string, { x: number; y: number }>()
      selectedIds.forEach((id) => {
        if (id.startsWith('cell-')) {
          const cell = cells.find((c) => c.id === id)
          if (cell) {
            newDragStartPositions.set(id, { x: cell.x, y: cell.y })
          }
        } else {
          const pos = getBlockPosition(id)
          newDragStartPositions.set(id, pos)
        }
      })
      if (newDragStartPositions.size === 0) {
        newDragStartPositions.set(cellId, { x: cellX, y: cellY })
      }
      setDragStartPositions(newDragStartPositions)
    },
    [position, zoom, selectedIds, cells, getBlockPosition],
  )

  const handleTextChange = useCallback(
    (cellId: string, newText: string) => {
      const cell = cells.find((c) => c.id === cellId)
      if (cell) {
        updateCell({ ...cell, text: newText })
      }
    },
    [cells, updateCell],
  )

  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom + ZOOM_STEP, ZOOM_MAX))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom - ZOOM_STEP, ZOOM_MIN))
  }, [])

  // Context menu handlers
  const handleContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>, blockId?: string) => {
      e.preventDefault()
      e.stopPropagation()

      // If clicking on a block that's not selected, select it first
      if (blockId && !selectedIds.has(blockId)) {
        setSelectedIds(new Set([blockId]))
      }

      setContextMenu({ x: e.clientX, y: e.clientY })
    },
    [selectedIds],
  )

  const handleCopy = useCallback(() => {
    if (selectedIds.size === 0) return

    const itemsToCopy = Array.from(selectedIds)
      .map((id) => {
        if (id.startsWith('cell-')) {
          const cell = cells.find((c) => c.id === id)
          return cell ? { type: 'cell' as const, data: cell } : null
        } else if (id.startsWith('scholarship-')) {
          const scholarship = scholarships.find((s) => s.id === id)
          return scholarship
            ? { type: 'scholarship' as const, data: scholarship }
            : null
        } else if (id.startsWith('essay-')) {
          const essay = essays.find((e) => e.id === id)
          return essay ? { type: 'essay' as const, data: essay } : null
        } else if (id.startsWith('json-')) {
          const jsonOutput = jsonOutputs.find((j) => j.id === id)
          return jsonOutput
            ? { type: 'jsonOutput' as const, data: jsonOutput }
            : null
        }
        return null
      })
      .filter(Boolean) as Array<{
      type: 'cell' | 'scholarship' | 'essay' | 'jsonOutput'
      data: unknown
    }>

    setClipboard(itemsToCopy)
  }, [selectedIds, cells, scholarships, essays, jsonOutputs])

  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.length === 0) return

    const newIds = new Set<string>()

    clipboard.forEach((item) => {
      if (item.type === 'cell') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cellData = item.data as any
        const newId = addCell({
          x: cellData.x + 50,
          y: cellData.y + 50,
          color: cellData.color,
          text: cellData.text,
          rotation: cellData.rotation,
        })
        newIds.add(newId)
      } else if (item.type === 'scholarship') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scholarshipData = item.data as any
        const newId = addScholarship({
          title: scholarshipData.title,
          description: scholarshipData.description,
          prompt: scholarshipData.prompt,
          hiddenRequirements: scholarshipData.hiddenRequirements,
        })
        const pos = getBlockPosition(scholarshipData.id)
        updateBlockPosition(newId, pos.x + 50, pos.y + 50)
        newIds.add(newId)
      } else if (item.type === 'essay') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const essayData = item.data as any
        const newId = addEssay({
          scholarshipId: essayData.scholarshipId,
          content: essayData.content,
          maxWordCount: essayData.maxWordCount,
        })
        const pos = getBlockPosition(essayData.id)
        updateBlockPosition(newId, pos.x + 50, pos.y + 50)
        newIds.add(newId)
      }
    })

    setSelectedIds(newIds)
  }, [
    clipboard,
    addCell,
    addScholarship,
    addEssay,
    getBlockPosition,
    updateBlockPosition,
  ])

  const handleDelete = useCallback(() => {
    if (selectedIds.size === 0) return

    selectedIds.forEach((id) => {
      if (id.startsWith('cell-')) {
        deleteCell(id)
      } else if (id.startsWith('scholarship-')) {
        deleteScholarship(id)
      } else if (id.startsWith('essay-')) {
        deleteEssay(id)
      } else if (id.startsWith('json-')) {
        deleteJsonOutput(id)
      }
    })
    setSelectedIds(new Set())
  }, [
    selectedIds,
    deleteCell,
    deleteScholarship,
    deleteEssay,
    deleteJsonOutput,
  ])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // Tool shortcuts (V and H only work when not using cmd/ctrl)
      if (e.key === 'v' && !e.metaKey && !e.ctrlKey) {
        setActiveTool('select')
        return
      }
      if (e.key === 'h' && !e.metaKey && !e.ctrlKey) {
        setActiveTool('hand')
        return
      }

      // Copy (only when items are selected)
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (selectedIds.size > 0) {
          e.preventDefault()
          handleCopy()
        }
      }

      // Paste (works even when nothing selected)
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault()
        handlePaste()
      }

      // Cut (only when items are selected)
      if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
        if (selectedIds.size > 0) {
          e.preventDefault()
          handleCopy()
          handleDelete()
        }
      }

      // Delete (only when items are selected)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedIds.size > 0) {
          e.preventDefault()
          handleDelete()
        }
      }

      // Undo (placeholder - would need more complex state management)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        // TODO: Implement undo
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, handleCopy, handlePaste, handleDelete])

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      // Zoom with cmd/ctrl + scroll
      e.preventDefault()

      const delta = e.deltaY
      if (delta < 0) {
        setZoom((prevZoom) => Math.min(prevZoom + ZOOM_STEP, ZOOM_MAX))
      } else if (delta > 0) {
        setZoom((prevZoom) => Math.max(prevZoom - ZOOM_STEP, ZOOM_MIN))
      }
    } else {
      // Pan with trackpad/scroll wheel
      e.preventDefault()
      setPosition((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }))
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  const dotOpacity = zoom
  const dotColor = `rgba(208, 201, 184, ${dotOpacity})`

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-[#f5f3ed] select-none"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => handleContextMenu(e)}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        cursor: isPanning
          ? 'grabbing'
          : activeTool === 'hand'
            ? 'grab'
            : activeTool === 'select'
              ? 'default'
              : 'default',
      }}
    >
      {/* Draggable Toolbar */}
      <DraggableToolbar
        onAddCell={addNewCell}
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-50">
        <ZoomComponent
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </div>

      {/* Syncing indicator */}
      {syncingData && (
        <div className="absolute bottom-4 left-4 text-sm text-gray-500">
          Syncing...
        </div>
      )}

      {/* Panning canvas - infinite canvas that moves and scales */}
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
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
            onContextMenu={(e, cellId) => handleContextMenu(e, cellId)}
            onTextChange={handleTextChange}
            onDelete={deleteCell}
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
              isSelected={selectedIds.has(scholarship.id)}
              onMouseDown={handleBlockMouseDown}
              onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
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
          const scholarship = scholarships.find(
            (s) => s.id === essay.scholarshipId,
          )
          return (
            <DraggableBlock
              key={essay.id}
              id={essay.id}
              x={pos.x}
              y={pos.y}
              isDragging={draggingCellId === essay.id}
              isSelected={selectedIds.has(essay.id)}
              onMouseDown={handleBlockMouseDown}
              onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
            >
              <EssayBlock
                data={essay}
                scholarshipTitle={scholarship?.title}
                onUpdate={updateEssay}
                onDelete={deleteEssay}
                isGenerating={false}
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
              isSelected={selectedIds.has(jsonOutput.id)}
              onMouseDown={handleBlockMouseDown}
              onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
            >
              <JsonOutputBlock
                data={jsonOutput.data}
                onDelete={() => deleteJsonOutput(jsonOutput.id)}
              />
            </DraggableBlock>
          )
        })}
      </div>
    </div>
  )
}
