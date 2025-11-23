'use client'

import { useState, useCallback, useEffect, ReactNode, useRef } from 'react'
import {
  StickyNote,
  GripHorizontal,
  Hand,
  MousePointer,
  Copy,
  Trash2,
  Clipboard,
  RotateCcw,
} from 'lucide-react'
import { brandColors, colorsLight, colorsDark } from '../styles/design-system'
import { useDarkMode } from '../context/DarkModeContext'

type ToolbarPosition = 'top' | 'right' | 'bottom'
export type Tool = 'select' | 'hand'

interface DraggableToolbarProps {
  onAddCell: () => void
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  onClearBoard: () => void
}

interface ToolButtonProps {
  icon: ReactNode
  title: string
  isActive: boolean
  onClick: () => void
  isDarkMode?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  onCopy: () => void
  onPaste: () => void
  onDelete: () => void
  onClose: () => void
  hasSelection: boolean
  isDarkMode?: boolean
}

// ToolButton component
function ToolButton({
  icon,
  title,
  isActive,
  onClick,
  isDarkMode = false,
}: ToolButtonProps) {
  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg transition-colors"
      style={{
        backgroundColor: isActive ? brandColors.teal : 'transparent',
        color: isActive ? brandColors.foregroundDark : colors.text.primary,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? brandColors.backgroundDark
            : brandColors.pampas
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
      title={title}
    >
      {icon}
    </button>
  )
}

// ContextMenu component
function ContextMenu({
  x,
  y,
  onCopy,
  onPaste,
  onDelete,
  onClose,
  hasSelection,
  isDarkMode = false,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const colors = isDarkMode ? colorsDark : colorsLight

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-100 rounded-lg shadow-xl py-1.5 min-w-40 select-none border"
      style={{
        left: x,
        top: y,
        backgroundColor: colors.background.elevated,
        borderColor: brandColors.cloudy,
      }}
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (hasSelection) {
            onCopy()
          }
          onClose()
        }}
        disabled={!hasSelection}
        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium transition-colors"
        style={{
          color: hasSelection ? colors.text.primary : colors.text.secondary,
          cursor: hasSelection ? 'pointer' : 'not-allowed',
          opacity: hasSelection ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          if (hasSelection) {
            e.currentTarget.style.backgroundColor = isDarkMode
              ? brandColors.backgroundDark
              : brandColors.pampas
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Copy size={16} />
        Copy
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onPaste()
          onClose()
        }}
        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium transition-colors cursor-pointer"
        style={{
          color: colors.text.primary,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? brandColors.backgroundDark
            : brandColors.pampas
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Clipboard size={16} />
        Paste
      </button>
      <div
        className="border-t my-1"
        style={{ borderColor: brandColors.cloudy }}
      />
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (hasSelection) {
            onDelete()
          }
          onClose()
        }}
        disabled={!hasSelection}
        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium transition-colors"
        style={{
          color: hasSelection ? brandColors.maroon : colors.text.secondary,
          cursor: hasSelection ? 'pointer' : 'not-allowed',
          opacity: hasSelection ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          if (hasSelection) {
            e.currentTarget.style.backgroundColor = `${brandColors.maroon}33`
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  )
}

// Main DraggableToolbar component
const POSITIONS: Record<ToolbarPosition, { className: string }> = {
  top: {
    className: 'top-4 left-1/2 -translate-x-1/2 flex-row',
  },
  right: {
    className: 'right-4 top-1/2 -translate-y-1/2 flex-col',
  },
  bottom: {
    className: 'bottom-4 left-1/2 -translate-x-1/2 flex-row',
  },
}

export default function DraggableToolbar({
  onAddCell,
  activeTool,
  onToolChange,
  onClearBoard,
}: DraggableToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition>('bottom')
  const [isDragging, setIsDragging] = useState(false)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragPos({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)

      setDragPos((currentPos) => {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        const distances = {
          top: Math.sqrt(
            Math.pow(currentPos.x - viewportWidth / 2, 2) +
              Math.pow(currentPos.y - 50, 2),
          ),
          right: Math.sqrt(
            Math.pow(currentPos.x - (viewportWidth - 50), 2) +
              Math.pow(currentPos.y - viewportHeight / 2, 2),
          ),
          bottom: Math.sqrt(
            Math.pow(currentPos.x - viewportWidth / 2, 2) +
              Math.pow(currentPos.y - (viewportHeight - 50), 2),
          ),
        }

        const closest = Object.entries(distances).reduce((a, b) =>
          a[1] < b[1] ? a : b,
        )[0] as ToolbarPosition

        setPosition(closest)
        return currentPos
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const positionConfig = POSITIONS[position]
  const isVertical = position === 'right'
  const dividerClassName = isVertical ? 'h-px w-6' : 'w-px h-6'
  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <div
      suppressHydrationWarning
      className={`fixed z-50 flex items-center gap-1 p-2 backdrop-blur-md rounded-xl shadow-lg border ${isDragging ? 'cursor-grabbing' : ''} ${!isDragging ? `${positionConfig.className} transition-all duration-300` : ''}`}
      style={
        isDragging
          ? {
              left: dragPos.x - 40,
              top: dragPos.y - 20,
              transform: 'none',
              backgroundColor: `${colors.background.paper}e6`,
              borderColor: brandColors.cloudy,
            }
          : {
              backgroundColor: `${colors.background.paper}e6`,
              borderColor: brandColors.cloudy,
            }
      }
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="p-1 cursor-grab active:cursor-grabbing transition-colors"
        style={{ color: colors.text.secondary }}
      >
        <GripHorizontal size={16} />
      </div>

      {/* Divider */}
      <div
        className={dividerClassName}
        style={{ backgroundColor: brandColors.cloudy }}
      />

      {/* Select Tool */}
      <ToolButton
        icon={<MousePointer size={20} />}
        title="Select (V)"
        isActive={activeTool === 'select'}
        onClick={() => onToolChange('select')}
        isDarkMode={isDarkMode}
      />

      {/* Hand Tool */}
      <ToolButton
        icon={<Hand size={20} />}
        title="Hand Tool (H)"
        isActive={activeTool === 'hand'}
        onClick={() => onToolChange('hand')}
        isDarkMode={isDarkMode}
      />

      {/* Divider */}
      <div
        className={dividerClassName}
        style={{ backgroundColor: brandColors.cloudy }}
      />

      {/* Add Cell Button */}
      <button
        onClick={onAddCell}
        className="p-2 rounded-lg transition-colors cursor-pointer"
        style={{ color: colors.text.primary }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? brandColors.backgroundDark
            : brandColors.pampas
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title="Add Cell"
      >
        <StickyNote size={20} />
      </button>

      {/* Divider */}
      <div
        className={dividerClassName}
        style={{ backgroundColor: brandColors.cloudy }}
      />

      {/* Clear Board Button */}
      <button
        onClick={onClearBoard}
        className="p-2 rounded-lg transition-colors cursor-pointer"
        style={{ color: brandColors.cloudy }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${brandColors.cloudy}33`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title="Clear Board"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  )
}

export { ToolButton, ContextMenu }
