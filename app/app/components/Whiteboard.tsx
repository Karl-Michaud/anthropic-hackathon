'use client'

import { useRef, useState, useCallback, useEffect, MouseEvent } from 'react'
import Cell from './Cell'
import ZoomComponent from './ZoomComponent'
import DraggableToolbar, { Tool } from './toolbar/DraggableToolbar'
import ContextMenu from './toolbar/ContextMenu'
import DraggableBlock from './DraggableBlock'
import ScholarshipWithActions from './scholarship/ScholarshipWithActions'
import EssayBlock from './essay/EssayBlock'
import JsonOutputBlock from './scholarship/JsonOutputBlock'
import { useWhiteboard } from '../context/WhiteboardContext'
import { useEditing } from '../context/EditingContext'

const ZOOM_MIN = 0.06
const ZOOM_MAX = 1.0
const ZOOM_STEP = 0.1
const CANVAS_LIMIT = 65000 // Figma-style canvas size limit in pixels

export default function Whiteboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.0)

  const [draggingCellId, setDraggingCellId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStartPositions, setDragStartPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

  const [generatingEssayFor, setGeneratingEssayFor] = useState<string | null>(null)

  // Mouse position for zoom-to-cursor
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>('select')

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // Clipboard state
  const [clipboard, setClipboard] = useState<Array<{
    type: 'cell' | 'scholarship' | 'essay' | 'jsonOutput'
    data: any
  }> | null>(null)

  // Selection box state
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

  // Helper function to clamp coordinates to canvas limits
  const clampToCanvas = useCallback((x: number, y: number) => {
    return {
      x: Math.max(-CANVAS_LIMIT, Math.min(CANVAS_LIMIT, x)),
      y: Math.max(-CANVAS_LIMIT, Math.min(CANVAS_LIMIT, y)),
    }
  }, [])

  // Initialize positions for new scholarships
  useEffect(() => {
    scholarships.forEach((scholarship) => {
      const existing = blockPositions.find((p) => p.id === scholarship.id)
      if (!existing) {
        const viewportCenterX = window.innerWidth / 2
        const viewportCenterY = window.innerHeight / 2
        const canvasX = (viewportCenterX - position.x) / zoom - 275
        const canvasY = (viewportCenterY - position.y) / zoom - 200
        const clamped = clampToCanvas(canvasX, canvasY)
        updateBlockPosition(scholarship.id, clamped.x, clamped.y)
      }
    })
  }, [scholarships, blockPositions, position, zoom, updateBlockPosition, clampToCanvas])

  // Initialize positions for new essays
  useEffect(() => {
    essays.forEach((essay) => {
      const existing = blockPositions.find((p) => p.id === essay.id)
      if (!existing) {
        const viewportCenterX = window.innerWidth / 2
        const viewportCenterY = window.innerHeight / 2
        const canvasX = (viewportCenterX - position.x) / zoom - 250 + Math.random() * 100
        const canvasY = (viewportCenterY - position.y) / zoom - 150 + Math.random() * 100
        const clamped = clampToCanvas(canvasX, canvasY)
        updateBlockPosition(essay.id, clamped.x, clamped.y)
      }
    })
  }, [essays, blockPositions, position, zoom, updateBlockPosition, clampToCanvas])

  // Initialize positions for new JSON outputs (placed to the right of scholarship)
  useEffect(() => {
    jsonOutputs.forEach((jsonOutput) => {
      const existing = blockPositions.find((p) => p.id === jsonOutput.id)
      if (!existing) {
        const scholarshipPos = blockPositions.find((p) => p.id === jsonOutput.scholarshipId)
        const canvasX = scholarshipPos ? scholarshipPos.x + 580 : 700
        const canvasY = scholarshipPos ? scholarshipPos.y : 100
        const clamped = clampToCanvas(canvasX, canvasY)
        updateBlockPosition(jsonOutput.id, clamped.x, clamped.y)
      }
    })
  }, [jsonOutputs, blockPositions, updateBlockPosition, clampToCanvas])

  const handleBlockMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>, blockId: string, blockX: number, blockY: number) => {
      e.stopPropagation()

      // Close context menu if open
      if (contextMenu) {
        setContextMenu(null)
      }

      if (activeTool === 'hand') {
        // Hand tool: just pan, don't interact with blocks
        return
      }

      // Select tool: handle selection and dragging
      if (e.button === 0) {
        let newSelectedIds = selectedIds

        // Handle multi-selection with cmd/ctrl
        if (e.metaKey || e.ctrlKey) {
          setSelectedIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(blockId)) {
              newSet.delete(blockId)
            } else {
              newSet.add(blockId)
            }
            newSelectedIds = newSet
            return newSet
          })
        } else {
          // Single selection
          if (!selectedIds.has(blockId)) {
            newSelectedIds = new Set([blockId])
            setSelectedIds(newSelectedIds)
          }
        }

        // Start dragging - store positions of all selected items
        const positions = new Map<string, { x: number; y: number }>()

        newSelectedIds.forEach((id) => {
          if (id.startsWith('cell-')) {
            const cell = cells.find((c) => c.id === id)
            if (cell) {
              positions.set(id, { x: cell.x, y: cell.y })
            }
          } else {
            const pos = getBlockPosition(id)
            positions.set(id, { x: pos.x, y: pos.y })
          }
        })

        setDragStartPositions(positions)
        setDraggingCellId(blockId)
        setDragOffset({
          x: e.clientX - position.x - blockX * zoom,
          y: e.clientY - position.y - blockY * zoom,
        })
      }
    },
    [position, zoom, activeTool, selectedIds, contextMenu, cells, getBlockPosition]
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
    const randomRotation = Math.floor(Math.random() * 7) - 3

    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2

    const cellWidth = 192
    const cellHeight = 192

    const canvasCenterX = (viewportCenterX - position.x) / zoom - cellWidth / 2
    const canvasCenterY = (viewportCenterY - position.y) / zoom - cellHeight / 2

    // Clamp to canvas limits
    const clamped = clampToCanvas(canvasCenterX, canvasCenterY)

    addCell({
      x: clamped.x,
      y: clamped.y,
      color: randomColor,
      text: 'Double click to edit...',
      rotation: randomRotation,
    })
  }, [position, zoom, addCell, clampToCanvas])

  const handleCanvasMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isEditing) return

      // Close context menu if open
      if (contextMenu) {
        setContextMenu(null)
        return
      }

      if (e.button === 0 && !draggingCellId) {
        // Hand tool always pans
        if (activeTool === 'hand') {
          setIsPanning(true)
          setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
          })
        } else if (activeTool === 'select') {
          // Select tool: start selection box
          // Clear selection if not holding cmd/ctrl
          if (!e.metaKey && !e.ctrlKey) {
            setSelectedIds(new Set())
          }
          // Start selection box
          setSelectionBox({
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
          })
        }
      }
    },
    [position, draggingCellId, isEditing, activeTool, contextMenu],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // Track mouse position for zoom-to-cursor
      setMousePosition({ x: e.clientX, y: e.clientY })

      if (isPanning && !draggingCellId) {
        const newX = e.clientX - startPos.x
        const newY = e.clientY - startPos.y
        setPosition({ x: newX, y: newY })
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

            // Clamp to canvas limits
            const clamped = clampToCanvas(newItemX, newItemY)

            if (id.startsWith('cell-')) {
              const cell = cells.find((c) => c.id === id)
              if (cell) {
                updateCell({ ...cell, x: clamped.x, y: clamped.y })
              }
            } else {
              updateBlockPosition(id, clamped.x, clamped.y)
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
    [isPanning, draggingCellId, startPos, dragOffset, position, zoom, cells, updateCell, updateBlockPosition, selectionBox, dragStartPositions, clampToCanvas],
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
  }, [selectionBox, position, zoom, cells, scholarships, essays, jsonOutputs, selectedIds, getBlockPosition])

  const handleCellMouseDown = useCallback(
    (
      e: MouseEvent<HTMLDivElement>,
      cellId: string,
      cellX: number,
      cellY: number,
    ) => {
      e.stopPropagation()

      // Close context menu if open
      if (contextMenu) {
        setContextMenu(null)
      }

      if (activeTool === 'hand') {
        // Hand tool: just pan, don't interact with cells
        return
      }

      // Select tool: handle selection and dragging
      if (e.button === 0) {
        let newSelectedIds = selectedIds

        // Handle multi-selection with cmd/ctrl
        if (e.metaKey || e.ctrlKey) {
          setSelectedIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(cellId)) {
              newSet.delete(cellId)
            } else {
              newSet.add(cellId)
            }
            newSelectedIds = newSet
            return newSet
          })
        } else {
          // Single selection
          if (!selectedIds.has(cellId)) {
            newSelectedIds = new Set([cellId])
            setSelectedIds(newSelectedIds)
          }
        }

        // Start dragging - store positions of all selected items
        const positions = new Map<string, { x: number; y: number }>()

        newSelectedIds.forEach((id) => {
          if (id.startsWith('cell-')) {
            const cell = cells.find((c) => c.id === id)
            if (cell) {
              positions.set(id, { x: cell.x, y: cell.y })
            }
          } else {
            const pos = getBlockPosition(id)
            positions.set(id, { x: pos.x, y: pos.y })
          }
        })

        setDragStartPositions(positions)
        setDraggingCellId(cellId)
        setDragOffset({
          x: e.clientX - position.x - cellX * zoom,
          y: e.clientY - position.y - cellY * zoom,
        })
      }
    },
    [position, zoom, activeTool, selectedIds, contextMenu, cells, getBlockPosition],
  )

  const handleTextChange = useCallback((cellId: string, newText: string) => {
    const cell = cells.find((c) => c.id === cellId)
    if (cell) {
      updateCell({ ...cell, text: newText })
    }
  }, [cells, updateCell])

  // Helper function to zoom towards a specific point (zoom-to-cursor)
  const zoomToPoint = useCallback(
    (newZoom: number, pointX?: number, pointY?: number) => {
      const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom))

      // If no point provided, use mouse position or viewport center
      let zoomPointX = pointX
      let zoomPointY = pointY

      if (zoomPointX === undefined || zoomPointY === undefined) {
        if (mousePosition) {
          zoomPointX = mousePosition.x
          zoomPointY = mousePosition.y
        } else {
          // Fallback to viewport center if no mouse position tracked
          zoomPointX = window.innerWidth / 2
          zoomPointY = window.innerHeight / 2
        }
      }

      // Calculate what point on the canvas is currently at the zoom point
      const canvasX = (zoomPointX - position.x) / zoom
      const canvasY = (zoomPointY - position.y) / zoom

      // Calculate new position so the same canvas point stays under the zoom point
      const newX = zoomPointX - canvasX * clampedZoom
      const newY = zoomPointY - canvasY * clampedZoom

      setZoom(clampedZoom)
      setPosition({ x: newX, y: newY })
    },
    [zoom, position, mousePosition]
  )

  const handleZoomIn = useCallback(() => {
    zoomToPoint(zoom + ZOOM_STEP)
  }, [zoom, zoomToPoint])

  const handleZoomOut = useCallback(() => {
    zoomToPoint(zoom - ZOOM_STEP)
  }, [zoom, zoomToPoint])

  // Recenter viewport to show all objects (zoom to fit)
  const recenterToObjects = useCallback(() => {
    // Collect all object positions and dimensions
    const objects: Array<{ x: number; y: number; width: number; height: number }> = []
    const allObjectIds = new Set<string>()

    // Add cells
    cells.forEach((cell) => {
      objects.push({ x: cell.x, y: cell.y, width: 192, height: 192 })
      allObjectIds.add(cell.id)
    })

    // Add scholarships
    scholarships.forEach((scholarship) => {
      const pos = getBlockPosition(scholarship.id)
      objects.push({ x: pos.x, y: pos.y, width: 550, height: 400 })
      allObjectIds.add(scholarship.id)
    })

    // Add essays
    essays.forEach((essay) => {
      const pos = getBlockPosition(essay.id)
      objects.push({ x: pos.x, y: pos.y, width: 500, height: 400 })
      allObjectIds.add(essay.id)
    })

    // Add JSON outputs
    jsonOutputs.forEach((jsonOutput) => {
      const pos = getBlockPosition(jsonOutput.id)
      objects.push({ x: pos.x, y: pos.y, width: 400, height: 300 })
      allObjectIds.add(jsonOutput.id)
    })

    // If no objects, do nothing
    if (objects.length === 0) {
      return
    }

    // Calculate bounding box
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    objects.forEach((obj) => {
      minX = Math.min(minX, obj.x)
      minY = Math.min(minY, obj.y)
      maxX = Math.max(maxX, obj.x + obj.width)
      maxY = Math.max(maxY, obj.y + obj.height)
    })

    // Calculate bounds size
    const boundsWidth = maxX - minX
    const boundsHeight = maxY - minY

    // Calculate center of all objects
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // Calculate viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate zoom needed to fit all objects with 15% padding
    const paddingFactor = 1.15 // 15% padding
    const zoomToFitWidth = viewportWidth / (boundsWidth * paddingFactor)
    const zoomToFitHeight = viewportHeight / (boundsHeight * paddingFactor)
    const zoomToFit = Math.min(zoomToFitWidth, zoomToFitHeight)

    // Clamp zoom to valid range [ZOOM_MIN, ZOOM_MAX]
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomToFit))

    // Position viewport so the center of objects appears at viewport center
    const viewportCenterX = viewportWidth / 2
    const viewportCenterY = viewportHeight / 2

    const newX = viewportCenterX - centerX * newZoom
    const newY = viewportCenterY - centerY * newZoom

    // Apply zoom and position
    setZoom(newZoom)
    setPosition({ x: newX, y: newY })

    // Select all objects to show their borders
    setSelectedIds(allObjectIds)
  }, [cells, scholarships, essays, jsonOutputs, getBlockPosition])

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
    [selectedIds]
  )

  const handleCopy = useCallback(() => {
    if (selectedIds.size === 0) return

    const itemsToCopy = Array.from(selectedIds).map((id) => {
      if (id.startsWith('cell-')) {
        const cell = cells.find((c) => c.id === id)
        return cell ? { type: 'cell' as const, data: cell } : null
      } else if (id.startsWith('scholarship-')) {
        const scholarship = scholarships.find((s) => s.id === id)
        return scholarship ? { type: 'scholarship' as const, data: scholarship } : null
      } else if (id.startsWith('essay-')) {
        const essay = essays.find((e) => e.id === id)
        return essay ? { type: 'essay' as const, data: essay } : null
      } else if (id.startsWith('json-')) {
        const jsonOutput = jsonOutputs.find((j) => j.id === id)
        return jsonOutput ? { type: 'jsonOutput' as const, data: jsonOutput } : null
      }
      return null
    }).filter(Boolean) as Array<{ type: 'cell' | 'scholarship' | 'essay' | 'jsonOutput'; data: any }>

    setClipboard(itemsToCopy)
  }, [selectedIds, cells, scholarships, essays, jsonOutputs])

  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.length === 0) return

    const newIds = new Set<string>()

    clipboard.forEach((item) => {
      if (item.type === 'cell') {
        const { id, ...cellData } = item.data
        const clamped = clampToCanvas(cellData.x + 50, cellData.y + 50)
        const newId = addCell({
          ...cellData,
          x: clamped.x,
          y: clamped.y,
        })
        newIds.add(newId)
      } else if (item.type === 'scholarship') {
        const newId = addScholarship({
          title: item.data.title,
          description: item.data.description,
          prompt: item.data.prompt,
          hiddenRequirements: item.data.hiddenRequirements,
          adaptiveWeights: item.data.adaptiveWeights,
        })
        const pos = getBlockPosition(item.data.id)
        const clamped = clampToCanvas(pos.x + 50, pos.y + 50)
        updateBlockPosition(newId, clamped.x, clamped.y)
        newIds.add(newId)
      } else if (item.type === 'essay') {
        const newId = addEssay({
          scholarshipId: item.data.scholarshipId,
          content: item.data.content,
          maxWordCount: item.data.maxWordCount,
        })
        const pos = getBlockPosition(item.data.id)
        const clamped = clampToCanvas(pos.x + 50, pos.y + 50)
        updateBlockPosition(newId, clamped.x, clamped.y)
        newIds.add(newId)
      }
    })

    setSelectedIds(newIds)
  }, [clipboard, addCell, addScholarship, addEssay, getBlockPosition, updateBlockPosition, clampToCanvas])

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
  }, [selectedIds, deleteCell, deleteScholarship, deleteEssay, deleteJsonOutput])

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

      // Zoom to fit all objects (Shift+1, which may produce '!' on some keyboards)
      if (e.shiftKey && (e.key === '1' || e.key === '!')) {
        e.preventDefault()
        recenterToObjects()
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
  }, [selectedIds, handleCopy, handlePaste, handleDelete, recenterToObjects])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        // Zoom with cmd/ctrl + scroll - zoom towards cursor
        e.preventDefault()

        const delta = e.deltaY
        const newZoom = delta < 0 ? zoom + ZOOM_STEP : zoom - ZOOM_STEP

        // Use the wheel event's mouse position for zoom-to-cursor
        zoomToPoint(newZoom, e.clientX, e.clientY)
      } else {
        // Pan with trackpad/scroll wheel
        e.preventDefault()
        setPosition((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }))
      }
    },
    [zoom, zoomToPoint]
  )

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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
          hasSelection={selectedIds.size > 0}
        />
      )}

      {/* Selection Box */}
      {selectionBox && (
        <div
          className="fixed pointer-events-none z-40"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
            border: '2px solid #3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          }}
        />
      )}

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
            isSelected={selectedIds.has(cell.id)}
            zoom={zoom}
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
              zoom={zoom}
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
          const scholarship = scholarships.find((s) => s.id === essay.scholarshipId)
          return (
            <DraggableBlock
              key={essay.id}
              id={essay.id}
              x={pos.x}
              y={pos.y}
              isDragging={draggingCellId === essay.id}
              isSelected={selectedIds.has(essay.id)}
              zoom={zoom}
              onMouseDown={handleBlockMouseDown}
              onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
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
              isSelected={selectedIds.has(jsonOutput.id)}
              zoom={zoom}
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
