'use client'

import { useRef, useState, useCallback, useEffect, MouseEvent } from 'react'
import Cell from './Cell'
import ZoomComponent from './ZoomComponent'
import DraggableToolbar, { Tool } from './toolbar/DraggableToolbar'
import DraggableBlock from './DraggableBlock'
import ScholarshipWithActions from './scholarship/ScholarshipWithActions'
import EssayBlock from './essay/EssayBlock'
import { useWhiteboard } from '../context/WhiteboardContext'
import { useEditing } from '../context/EditingContext'
import { saveEssayDraftToDB } from '../lib/dbUtils'

const ZOOM_MIN = 0.06
const ZOOM_MAX = 1.0
const ZOOM_STEP = 0.1
const CANVAS_LIMIT = 65000 // Figma-style canvas size limit in pixels

export default function Whiteboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const animationFrameRef = useRef<number | null>(null)

  const [isPanning, setIsPanning] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [momentum, setMomentum] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.0)

  const [draggingCellId, setDraggingCellId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [syncingData, setSyncingData] = useState(false)

  // Tool state
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
    type: 'cell' | 'scholarship' | 'essay'
    data: unknown
  }> | null>(null)
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const [zIndexStack, setZIndexStack] = useState<string[]>([])

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Helper function to update z-index stack when component is interacted with
  const bringToFront = useCallback((id: string) => {
    setZIndexStack((prevStack) => {
      // Remove id if it exists, then add to end
      const filtered = prevStack.filter((stackId) => stackId !== id)
      return [...filtered, id]
    })
  }, [])

  // Helper function to get z-index for a component based on stack position
  const getZIndex = useCallback(
    (id: string): number => {
      const index = zIndexStack.indexOf(id)
      if (index === -1) {
        return 1 // Base z-index for items not in stack
      }
      return index + 2 // Start at 2 so the lowest is always above base
    },
    [zIndexStack],
  )

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
  }, [
    scholarships,
    blockPositions,
    position,
    zoom,
    updateBlockPosition,
    clampToCanvas,
  ])

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
        const clamped = clampToCanvas(canvasX, canvasY)
        updateBlockPosition(essay.id, clamped.x, clamped.y)
      }
    })
  }, [
    essays,
    blockPositions,
    position,
    zoom,
    updateBlockPosition,
    clampToCanvas,
  ])

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
        const clamped = clampToCanvas(canvasX, canvasY)
        updateBlockPosition(jsonOutput.id, clamped.x, clamped.y)
      }
    })
  }, [jsonOutputs, blockPositions, updateBlockPosition, clampToCanvas])

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

      // Bring this block to front
      bringToFront(blockId)

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
    [position, zoom, selectedIds, getBlockPosition, bringToFront],
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
      selectionBox,
      dragStartPositions,
      clampToCanvas,
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

      // Bring this cell to front
      bringToFront(cellId)

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
    [position, zoom, selectedIds, cells, getBlockPosition, bringToFront],
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

  // Helper function to zoom towards a specific point (default: screen center)
  const zoomToPoint = useCallback(
    (newZoom: number, pointX?: number, pointY?: number) => {
      const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom))

      // Always use provided point, or default to viewport center
      // This ensures consistent, predictable zoom behavior pivoting at screen center
      const zoomPointX = pointX ?? window.innerWidth / 2
      const zoomPointY = pointY ?? window.innerHeight / 2

      // Calculate what point on the canvas is currently at the zoom point
      const canvasX = (zoomPointX - position.x) / zoom
      const canvasY = (zoomPointY - position.y) / zoom

      // Calculate new position so the same canvas point stays under the zoom point
      const newX = zoomPointX - canvasX * clampedZoom
      const newY = zoomPointY - canvasY * clampedZoom

      setZoom(clampedZoom)
      setPosition({ x: newX, y: newY })
    },
    [zoom, position],
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
    const objects: Array<{
      x: number
      y: number
      width: number
      height: number
    }> = []
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
  }, [cells, scholarships, essays, getBlockPosition])

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
        }
        return null
      })
      .filter(Boolean) as Array<{
      type: 'cell' | 'scholarship' | 'essay'
      data: unknown
    }>

    setClipboard(itemsToCopy)
  }, [selectedIds, cells, scholarships, essays])

  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.length === 0) return

    const newIds = new Set<string>()

    clipboard.forEach((item) => {
      if (item.type === 'cell') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        const { id: _id, ...cellData } = item.data as any
        const clamped = clampToCanvas(cellData.x + 50, cellData.y + 50)
        const newId = addCell({
          ...cellData,
          x: clamped.x,
          y: clamped.y,
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
        const clamped = clampToCanvas(pos.x + 50, pos.y + 50)
        updateBlockPosition(newId, clamped.x, clamped.y)
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
        const clamped = clampToCanvas(pos.x + 50, pos.y + 50)
        updateBlockPosition(newId, clamped.x, clamped.y)
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
    clampToCanvas,
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
      }
    })
    setSelectedIds(new Set())
  }, [selectedIds, deleteCell, deleteScholarship, deleteEssay])

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
    [zoom, zoomToPoint],
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
  const dotSize = 24 * zoom

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
        backgroundSize: `${dotSize}px ${dotSize}px`,
        backgroundPosition: `${position.x % dotSize}px ${position.y % dotSize}px`,
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
            isSelected={selectedIds.has(cell.id)}
            zoom={zoom}
            zIndex={getZIndex(cell.id)}
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
              zIndex={getZIndex(scholarship.id)}
              onMouseDown={handleBlockMouseDown}
              onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
            >
              <ScholarshipWithActions
                data={scholarship}
                onUpdate={updateScholarship}
                onDelete={deleteScholarship}
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
              zoom={zoom}
              zIndex={getZIndex(essay.id)}
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
      </div>
    </div>
  )
}
