'use client'

import { useState, useCallback, useEffect } from 'react'
import { StickyNote, GripHorizontal } from 'lucide-react'

type ToolbarPosition = 'top' | 'right' | 'bottom'

interface DraggableToolbarProps {
  onAddCell: () => void
}

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

export default function DraggableToolbar({ onAddCell }: DraggableToolbarProps) {
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

      // Calculate which position is closest
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Distance to each position's anchor point
      const distances = {
        top: Math.sqrt(
          Math.pow(dragPos.x - viewportWidth / 2, 2) + Math.pow(dragPos.y - 50, 2)
        ),
        right: Math.sqrt(
          Math.pow(dragPos.x - (viewportWidth - 50), 2) +
            Math.pow(dragPos.y - viewportHeight / 2, 2)
        ),
        bottom: Math.sqrt(
          Math.pow(dragPos.x - viewportWidth / 2, 2) +
            Math.pow(dragPos.y - (viewportHeight - 50), 2)
        ),
      }

      // Find closest position
      const closest = Object.entries(distances).reduce((a, b) =>
        a[1] < b[1] ? a : b
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

  return (
    <div
      className={`fixed z-50 flex items-center gap-1 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 ${
        isDragging ? 'cursor-grabbing' : ''
      } ${!isDragging ? `${positionConfig.className} transition-all duration-300` : ''}`}
      style={
        isDragging
          ? {
              left: dragPos.x - 40,
              top: dragPos.y - 20,
              transform: 'none',
            }
          : undefined
      }
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
      >
        <GripHorizontal size={16} />
      </div>

      {/* Add Cell Button */}
      <button
        onClick={onAddCell}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Add Cell"
      >
        <StickyNote size={20} className="text-gray-700" />
      </button>
    </div>
  )
}
