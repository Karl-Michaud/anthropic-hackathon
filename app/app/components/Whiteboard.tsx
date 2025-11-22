'use client'

import { useRef, useState, useCallback, useEffect, MouseEvent } from 'react'
import Cell from './Cell'
import ZoomComponent from './ZoomComponent'
import DraggableToolbar, { Tool } from './DraggableToolbar'
import DraggableBlock from './DraggableBlock'
import { ScholarshipBlock } from './ScholarshipBlock'
import EssayBlock from './EssayBlock'
import {
  submitFeedbackAnswers,
  analyzeSocraticQuestions,
} from './DynamicFeedback/utils/feedbackApi'
import FeedbackPanel from './FeedbackPanel'
import { useWhiteboard } from '../context/WhiteboardContext'
import { useEditing } from '../context/EditingContext'
import { useDarkMode } from '../context/DarkModeContext'
import { saveEssayDraftToDB } from '../lib/dbUtils'
import { requestClaude } from '../lib/request'
import type { IGenerateDraft } from '../types/interfaces'
import type {
  CellData,
  ScholarshipData,
  EssayData,
  JsonOutputData,
} from '../context/WhiteboardContext'
import type { FeedbackData } from './DynamicFeedback/types'

const ZOOM_MIN = 0.06
const ZOOM_MAX = 1.0
const ZOOM_STEP = 0.1
const CANVAS_LIMIT = 65000 // Figma-style canvas size limit in pixels

type ClipboardItem =
  | { type: 'cell'; data: CellData }
  | { type: 'scholarship'; data: ScholarshipData }
  | { type: 'essay'; data: EssayData }
  | { type: 'jsonOutput'; data: JsonOutputData }
  | { type: 'feedbackPanel'; data: FeedbackData }

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

  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const [draggingCellId, setDraggingCellId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [syncingData, setSyncingData] = useState(false)
  const [generatingEssayFor, setGeneratingEssayFor] = useState<string | null>(
    null,
  )

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
  const [clipboard, setClipboard] = useState<ClipboardItem[] | null>(null)
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const [zIndexStack, setZIndexStack] = useState<string[]>([])
  const [blockDimensions, setBlockDimensions] = useState<
    Map<string, { width: number; height: number }>
  >(new Map())
  const [isResizing, setIsResizing] = useState(false)
  const [resizingBlockId, setResizingBlockId] = useState<string | null>(null)
  const [resizeStartDimensions, setResizeStartDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  const {
    cells,
    scholarships,
    essays,
    jsonOutputs,
    feedbackPanels,
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
    updateFeedbackPanel,
    deleteFeedbackPanel,
    updateBlockPosition,
    getBlockPosition,
    clearAll,
  } = useWhiteboard()
  const { isEditing } = useEditing()

  // Helper function to clamp coordinates to canvas limits
  const clampToCanvas = useCallback((x: number, y: number) => {
    return {
      x: Math.max(-CANVAS_LIMIT, Math.min(CANVAS_LIMIT, x)),
      y: Math.max(-CANVAS_LIMIT, Math.min(CANVAS_LIMIT, y)),
    }
  }, [])

  // Auto-focus to show both feedback panel and essay
  const focusOnFeedbackAndEssay = useCallback(
    (feedbackId: string, essayId: string) => {
      const feedbackPos = getBlockPosition(feedbackId)
      const essayPos = getBlockPosition(essayId)

      // Calculate bounding box of both blocks
      const minX = feedbackPos.x
      const maxX = essayPos.x + 500 // essay width
      const minY = Math.min(feedbackPos.y, essayPos.y)
      const maxY = Math.max(feedbackPos.y + 600, essayPos.y + 400)

      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      const width = maxX - minX
      const height = maxY - minY

      // Calculate zoom to fit both with 20% padding
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const zoomX = viewportWidth / (width * 1.2)
      const zoomY = viewportHeight / (height * 1.2)
      const newZoom = Math.min(Math.max(zoomX, zoomY, ZOOM_MIN), ZOOM_MAX)

      // Center viewport on both blocks
      const viewportCenterX = viewportWidth / 2
      const viewportCenterY = viewportHeight / 2

      setPosition({
        x: viewportCenterX - centerX * newZoom,
        y: viewportCenterY - centerY * newZoom,
      })
      setZoom(newZoom)
    },
    [getBlockPosition],
  )

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

  // Initialize positions for new feedback panels (placed to the LEFT of essays)
  useEffect(() => {
    feedbackPanels.forEach((panel) => {
      const existing = blockPositions.find((p) => p.id === panel.id)
      if (!existing) {
        const essayPos = blockPositions.find((p) => p.id === panel.essayId)
        // Position 650px to the LEFT of essay
        const canvasX = essayPos ? essayPos.x - 650 : 100
        const canvasY = essayPos ? essayPos.y : 100
        const clamped = clampToCanvas(canvasX, canvasY)
        updateBlockPosition(panel.id, clamped.x, clamped.y)

        // Auto-focus to show both feedback and essay
        focusOnFeedbackAndEssay(panel.id, panel.essayId)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackPanels, blockPositions, updateBlockPosition, clampToCanvas])

  // Sync scholarship updates to database
  useEffect(() => {
    const syncTimer = setTimeout(async () => {
      if (scholarships.length > 0 && !syncingData) {
        setSyncingData(true)
        try {
          // Scholarships are tracked - sync if needed
          for (const scholarship of scholarships) {
            if (scholarship.id && scholarship.id.length > 0) {
              // Update sync logic here if needed
            }
          }
        } catch (error) {
          console.error('Failed to sync scholarships:', error)
        } finally {
          setSyncingData(false)
        }
      }
    }, 3000)

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
              await saveEssayDraftToDB(essay.scholarshipId, essay.content)
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

      // Close context menu if open
      if (contextMenu) {
        setContextMenu(null)
      }

      if (activeTool === 'hand') {
        // Hand tool: just pan, don't interact with blocks
        return
      }

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
    [
      position,
      zoom,
      selectedIds,
      getBlockPosition,
      bringToFront,
      contextMenu,
      activeTool,
    ],
  )

  const handleResizeStart = useCallback(
    (
      e: MouseEvent<HTMLDivElement>,
      blockId: string,
      startX: number,
      startY: number,
      startWidth: number,
      startHeight: number,
    ) => {
      e.stopPropagation()
      setIsResizing(true)
      setResizingBlockId(blockId)
      setDragOffset({
        x: startX,
        y: startY,
      })
      setResizeStartDimensions({
        width: startWidth,
        height: startHeight,
      })
      setMomentum({ x: 0, y: 0 })
    },
    [],
  )

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

        const essayContent = response.essay || ''

        const essayId = addEssay({
          scholarshipId,
          content: essayContent,
          maxWordCount: undefined,
          lastEditedAt: Date.now(),
        })

        // Position essay to the right of the scholarship
        const scholarshipPos = getBlockPosition(scholarshipId)
        const essayX = scholarshipPos.x + 600 // 550px width + 50px gap
        const essayY = scholarshipPos.y

        updateBlockPosition(essayId, essayX, essayY)

        // Save to database
        if (scholarship.id) {
          await saveEssayDraftToDB(scholarship.id, essayContent)
        }
      } catch (error) {
        console.error('Failed to generate essay:', error)
      } finally {
        setGeneratingEssayFor(null)
      }
    },
    [scholarships, addEssay, getBlockPosition, updateBlockPosition],
  )

  const handleGenerateSocraticQuestions = useCallback(
    async (essayId: string) => {
      const essay = essays.find((e) => e.id === essayId)
      if (!essay) return

      try {
        const scholarship = scholarships.find(
          (s) => s.id === essay.scholarshipId,
        )
        const analysisResult = await analyzeSocraticQuestions(
          essay.content,
          scholarship?.title,
        )

        updateEssay({
          ...essay,
          highlightedSections: analysisResult.highlightedSections,
          socraticData: analysisResult.socraticData,
        })
      } catch (error) {
        console.error('Failed to generate Socratic questions:', error)
      }
    },
    [essays, scholarships, updateEssay],
  )

  // Auto-generate Socratic questions for new essays without highlights
  useEffect(() => {
    const essaysWithoutHighlights = essays.filter((essay) => {
      // Only generate for essays with content and no highlights
      if (!essay.content || essay.content.trim().length === 0) return false
      if (essay.highlightedSections && essay.highlightedSections.length > 0) {
        return false
      }
      // Only generate if essay was recently modified (within last 2 seconds)
      // This prevents continuous regeneration
      const now = Date.now()
      const lastEdited = essay.lastEditedAt || 0
      return now - lastEdited < 2000
    })

    if (essaysWithoutHighlights.length === 0) return

    // Generate highlights for the first essay without highlights
    const essayToProcess = essaysWithoutHighlights[0]
    const timer = setTimeout(() => {
      handleGenerateSocraticQuestions(essayToProcess.id)
    }, 500)

    return () => clearTimeout(timer)
  }, [essays, handleGenerateSocraticQuestions])

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
      if (isResizing && resizingBlockId && resizeStartDimensions) {
        const deltaX = (e.clientX - dragOffset.x) / zoom
        const deltaY = (e.clientY - dragOffset.y) / zoom

        const newWidth = Math.max(200, resizeStartDimensions.width + deltaX)
        const newHeight = Math.max(200, resizeStartDimensions.height + deltaY)

        setBlockDimensions((prev) => {
          const updated = new Map(prev)
          updated.set(resizingBlockId, { width: newWidth, height: newHeight })
          return updated
        })
        return
      }

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
      isResizing,
      resizingBlockId,
      resizeStartDimensions,
      dragOffset,
      zoom,
      isPanning,
      draggingCellId,
      startPos,
      position,
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
    setIsResizing(false)
    setResizingBlockId(null)
    setResizeStartDimensions(null)

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

      // Check feedback panels
      feedbackPanels.forEach((panel) => {
        const pos = getBlockPosition(panel.id)
        const blockLeft = pos.x
        const blockRight = pos.x + 600
        const blockTop = pos.y
        const blockBottom = pos.y + 600

        if (
          blockRight > canvasBoxLeft &&
          blockLeft < canvasBoxRight &&
          blockBottom > canvasBoxTop &&
          blockTop < canvasBoxBottom
        ) {
          newSelectedIds.add(panel.id)
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
    feedbackPanels,
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

    // Add JSON outputs
    jsonOutputs.forEach((jsonOutput) => {
      const pos = getBlockPosition(jsonOutput.id)
      objects.push({ x: pos.x, y: pos.y, width: 400, height: 300 })
      allObjectIds.add(jsonOutput.id)
    })

    // Add feedback panels
    feedbackPanels.forEach((panel) => {
      const pos = getBlockPosition(panel.id)
      objects.push({ x: pos.x, y: pos.y, width: 600, height: 600 })
      allObjectIds.add(panel.id)
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
  }, [
    cells,
    scholarships,
    essays,
    jsonOutputs,
    feedbackPanels,
    getBlockPosition,
  ])

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
        } else if (id.startsWith('feedback-')) {
          const feedback = feedbackPanels.find((f) => f.id === id)
          return feedback
            ? { type: 'feedbackPanel' as const, data: feedback }
            : null
        }
        return null
      })
      .filter(Boolean) as ClipboardItem[]

    setClipboard(itemsToCopy)
  }, [selectedIds, cells, scholarships, essays, jsonOutputs, feedbackPanels])

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
          title: item.data.title,
          description: item.data.description,
          prompt: item.data.prompt,
          weights: item.data.weights,
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
      } else if (id.startsWith('json-')) {
        deleteJsonOutput(id)
      } else if (id.startsWith('feedback-')) {
        deleteFeedbackPanel(id)
      }
    })
    setSelectedIds(new Set())
  }, [
    selectedIds,
    deleteCell,
    deleteScholarship,
    deleteEssay,
    deleteJsonOutput,
    deleteFeedbackPanel,
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
  const dotColor = isDarkMode
    ? `rgba(107, 114, 128, ${dotOpacity})`
    : `rgba(208, 201, 184, ${dotOpacity})`
  const dotSize = 24 * zoom

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden select-none transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-neutral-50'
      }`}
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
        onClearBoard={() => {
          if (
            window.confirm(
              'Are you sure you want to clear the entire board? This cannot be undone.',
            )
          ) {
            clearAll()
            setSelectedIds(new Set())
            setZIndexStack([])
          }
        }}
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
          const dims = blockDimensions.get(scholarship.id) || {
            width: 550,
            height: 400,
          }
          return (
            <DraggableBlock
              key={scholarship.id}
              id={scholarship.id}
              x={pos.x}
              y={pos.y}
              width={dims.width}
              height={dims.height}
              isDragging={draggingCellId === scholarship.id}
              isSelected={selectedIds.has(scholarship.id)}
              zoom={zoom}
              zIndex={getZIndex(scholarship.id)}
              onMouseDown={handleBlockMouseDown}
              onResizeStart={handleResizeStart}
              onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
            >
              <ScholarshipBlock
                data={scholarship}
                onUpdate={updateScholarship}
                onDelete={deleteScholarship}
                onDraft={handleGenerateEssay}
                isGeneratingEssay={generatingEssayFor === scholarship.id}
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
          const dims = blockDimensions.get(essay.id) || {
            width: 500,
            height: 600,
          }
          return (
            <DraggableBlock
              key={essay.id}
              id={essay.id}
              x={pos.x}
              y={pos.y}
              width={dims.width}
              height={dims.height}
              isDragging={draggingCellId === essay.id}
              isSelected={selectedIds.has(essay.id)}
              zoom={zoom}
              zIndex={getZIndex(essay.id)}
              onMouseDown={handleBlockMouseDown}
              onResizeStart={handleResizeStart}
              onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
            >
              <EssayBlock
                data={essay}
                scholarshipTitle={scholarship?.title}
                onUpdate={updateEssay}
                onDelete={deleteEssay}
                isGenerating={generatingEssayFor === essay.scholarshipId}
                onGenerateSocraticQuestions={handleGenerateSocraticQuestions}
              />
            </DraggableBlock>
          )
        })}

        {/* Render feedback panels */}
        {feedbackPanels.map((feedbackData) => {
          const pos = getBlockPosition(feedbackData.id)
          const dims = blockDimensions.get(feedbackData.id) || {
            width: 600,
            height: 600,
          }
          return (
            <DraggableBlock
              key={feedbackData.id}
              id={feedbackData.id}
              x={pos.x}
              y={pos.y}
              width={dims.width}
              height={dims.height}
              isDragging={draggingCellId === feedbackData.id}
              isSelected={selectedIds.has(feedbackData.id)}
              zoom={zoom}
              zIndex={getZIndex(feedbackData.id)}
              onMouseDown={handleBlockMouseDown}
              onResizeStart={handleResizeStart}
              onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
            >
              <FeedbackPanel
                data={feedbackData}
                onClose={() => deleteFeedbackPanel(feedbackData.id)}
                onSectionAnswerChange={(sectionId, questionId, answer) => {
                  // Update section answer
                  const updatedSections = feedbackData.sections.map(
                    (section) =>
                      section.id === sectionId
                        ? {
                            ...section,
                            questions: section.questions.map((q) =>
                              q.id === questionId ? { ...q, answer } : q,
                            ),
                          }
                        : section,
                  )
                  updateFeedbackPanel(feedbackData.id, {
                    sections: updatedSections,
                  })
                }}
                onSectionComplete={(sectionId) => {
                  // Mark section as complete
                  const updatedSections = feedbackData.sections.map(
                    (section) =>
                      section.id === sectionId
                        ? { ...section, isComplete: true }
                        : section,
                  )
                  updateFeedbackPanel(feedbackData.id, {
                    sections: updatedSections,
                  })
                }}
                onSubmitToAI={async () => {
                  try {
                    // Find the associated essay
                    const essay = essays.find((e) => e.id === feedbackData.essayId)
                    if (!essay) {
                      console.error('Essay not found:', feedbackData.essayId)
                      return
                    }

                    // Submit feedback and get updated essay
                    const updatedEssayContent = await submitFeedbackAnswers(
                      feedbackData,
                      essay.content,
                    )

                    // Update the essay with the enhanced content
                    updateEssay({
                      ...essay,
                      content: updatedEssayContent,
                      highlightedSections: undefined, // Clear highlights to regenerate
                      socraticData: undefined,
                      lastEditedAt: Date.now(),
                    })

                    // Trigger regeneration of highlights
                    await handleGenerateSocraticQuestions(essay.id)

                    // Remove the feedback panel
                    deleteFeedbackPanel(feedbackData.id)
                  } catch (error) {
                    console.error('Error submitting feedback:', error)
                  }
                }}
              />
            </DraggableBlock>
          )
        })}
      </div>
    </div>
  )
}
