'use client'

import { ReactNode, MouseEvent } from 'react'

interface DraggableBlockProps {
  id: string
  x: number
  y: number
  isDragging: boolean
  isSelected?: boolean
  onMouseDown: (e: MouseEvent<HTMLDivElement>, id: string, x: number, y: number) => void
  onContextMenu?: (e: MouseEvent<HTMLDivElement>, id: string) => void
  children: ReactNode
}

export default function DraggableBlock({
  id,
  x,
  y,
  isDragging,
  isSelected = false,
  onMouseDown,
  onContextMenu,
  children,
}: DraggableBlockProps) {
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Only start drag if clicking on the block header area, not inside inputs
    const target = e.target as HTMLElement
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

  return (
    <div
      className={`absolute select-none ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}`}
      style={{
        left: x,
        top: y,
        transition: isDragging ? 'none' : 'box-shadow 0.2s, outline 0.2s',
        boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : undefined,
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '2px',
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  )
}
