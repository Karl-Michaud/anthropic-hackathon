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
} from 'lucide-react'
import { colors } from '../styles/design-system'

type ToolbarPosition = 'top' | 'right' | 'bottom'
export type Tool = 'select' | 'hand'

interface DraggableToolbarProps {
  onAddCell: () => void
  activeTool: Tool
  onToolChange: (tool: Tool) => void
}

interface ToolButtonProps {
  icon: ReactNode
  title: string
  isActive: boolean
  onClick: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  onCopy: () => void
  onPaste: () => void
  onDelete: () => void
  onClose: () => void
  hasSelection: boolean
}

// ToolButton component
function ToolButton({ icon, title, isActive, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        isActive ? 'text-white' : 'text-neutral-700 hover:bg-neutral-100'
      }`}
      style={{
        backgroundColor: isActive ? colors.primary[500] : 'transparent',
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
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

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
        backgroundColor: colors.neutral[900],
        borderColor: colors.neutral[700],
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
        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium transition-colors ${
          hasSelection ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}
        style={{
          color: hasSelection ? colors.neutral[100] : colors.neutral[500],
          backgroundColor: hasSelection
            ? `${colors.neutral[700]}33`
            : 'transparent',
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
          color: colors.neutral[100],
          backgroundColor: `${colors.neutral[700]}33`,
        }}
      >
        <Clipboard size={16} />
        Paste
      </button>
      <div
        className="border-t my-1"
        style={{ borderColor: colors.neutral[700] }}
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
        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium transition-colors ${
          hasSelection ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}
        style={{
          color: hasSelection ? colors.danger[400] : colors.neutral[600],
          backgroundColor: hasSelection
            ? `${colors.danger[900]}33`
            : 'transparent',
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
}: DraggableToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition>('bottom')
  const [isDragging, setIsDragging] = useState(false)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

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

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const distances = {
        top: Math.sqrt(
          Math.pow(dragPos.x - viewportWidth / 2, 2) +
            Math.pow(dragPos.y - 50, 2),
        ),
        right: Math.sqrt(
          Math.pow(dragPos.x - (viewportWidth - 50), 2) +
            Math.pow(dragPos.y - viewportHeight / 2, 2),
        ),
        bottom: Math.sqrt(
          Math.pow(dragPos.x - viewportWidth / 2, 2) +
            Math.pow(dragPos.y - (viewportHeight - 50), 2),
        ),
      }

      const closest = Object.entries(distances).reduce((a, b) =>
        a[1] < b[1] ? a : b,
      )[0] as ToolbarPosition

      setPosition(closest)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragPos])

  const positionConfig = POSITIONS[position]
  const isVertical = position === 'right'
  const dividerClassName = isVertical ? 'h-px w-6' : 'w-px h-6'

  return (
    <div
      className={`fixed z-50 flex items-center gap-1 p-2 backdrop-blur-md rounded-xl shadow-lg border ${
        isDragging ? 'cursor-grabbing' : ''
      } ${!isDragging ? `${positionConfig.className} transition-all duration-300` : ''}`}
      style={{
        backgroundColor: `${colors.neutral[0]}e6`,
        borderColor: colors.neutral[200],
        ...(isDragging
          ? {
              left: dragPos.x - 40,
              top: dragPos.y - 20,
              transform: 'none',
            }
          : {}),
      }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="p-1 cursor-grab active:cursor-grabbing transition-colors"
        style={{ color: colors.neutral[400] }}
      >
        <GripHorizontal size={16} />
      </div>

      {/* Divider */}
      <div
        className={dividerClassName}
        style={{ backgroundColor: colors.neutral[300] }}
      />

      {/* Select Tool */}
      <ToolButton
        icon={<MousePointer size={20} />}
        title="Select (V)"
        isActive={activeTool === 'select'}
        onClick={() => onToolChange('select')}
      />

      {/* Hand Tool */}
      <ToolButton
        icon={<Hand size={20} />}
        title="Hand Tool (H)"
        isActive={activeTool === 'hand'}
        onClick={() => onToolChange('hand')}
      />

      {/* Divider */}
      <div
        className={dividerClassName}
        style={{ backgroundColor: colors.neutral[300] }}
      />

      {/* Add Cell Button */}
      <button
        onClick={onAddCell}
        className="p-2 rounded-lg transition-colors cursor-pointer"
        style={{
          color: colors.neutral[700],
          backgroundColor: `${colors.neutral[100]}80`,
        }}
        title="Add Cell"
      >
        <StickyNote size={20} />
      </button>
    </div>
  )
}

export { ToolButton, ContextMenu }
