'use client'

import { ReactNode, MouseEvent } from 'react'
import { brandColors } from '../styles/design-system'

interface DraggableBlockProps {
  id: string
  x: number
  y: number
  isDragging: boolean
  isSelected?: boolean
  zoom: number
  zIndex?: number
  onMouseDown: (
    e: MouseEvent<HTMLDivElement>,
    id: string,
    x: number,
    y: number,
  ) => void
  onContextMenu?: (e: MouseEvent<HTMLDivElement>, id: string) => void
  children: ReactNode
}

export default function DraggableBlock({
  id,
  x,
  y,
  isDragging,
  isSelected = false,
  zoom,
  zIndex = 1,
  onMouseDown,
  onContextMenu,
  children,
}: DraggableBlockProps) {
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Allow drag from drag handles
    const target = e.target as HTMLElement
    if (target.closest('[data-drag-handle]')) {
      onMouseDown(e, id, x, y)
      return
    }

    // Prevent drag from inputs, buttons, textareas
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return
    }
    onMouseDown(e, id, x, y)
  }

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    if (onContextMenu) {
      onContextMenu(e, id)
    }
  }

  // Calculate inverse-scaled border width (Figma-style)
  // At 100% zoom (1.0): 2/1.0 = 2px
  // At 6% zoom (0.06): 2/0.06 = ~33px in canvas space = 2px on screen
  const outlineWidth = 2 / zoom
  const outlineOffset = 2 / zoom

  return (
    <div
      className={`absolute select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: x,
        top: y,
        transition: isDragging ? 'none' : 'box-shadow 0.2s, outline 0.2s',
        boxShadow: isDragging
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          : undefined,
        outline: isSelected
          ? `${outlineWidth}px solid ${brandColors.teal}`
          : 'none',
        outlineOffset: `${outlineOffset}px`,
        zIndex,
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  )
}
