'use client'

import { MouseEvent, useState, useRef, useEffect } from 'react'
import { useEditing } from '../context/EditingContext'
import { CellData } from '../context/WhiteboardContext'
import DeleteButton from './common/DeleteButton'

export type { CellData }

interface CellProps {
  cell: CellData
  isDragging: boolean
  onMouseDown: (
    e: MouseEvent<HTMLDivElement>,
    cellId: string,
    x: number,
    y: number,
  ) => void
  onContextMenu?: (e: MouseEvent<HTMLDivElement>, cellId: string) => void
  onTextChange: (cellId: string, newText: string) => void
  onDelete: (cellId: string) => void
}

export default function Cell({
  cell,
  isDragging,
  onMouseDown,
  onContextMenu,
  onTextChange,
  onDelete,
}: CellProps) {
  const [isEditingLocal, setIsEditingLocal] = useState(false)
  const [editText, setEditText] = useState(cell.text)
  const [isHovered, setIsHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setEditing } = useEditing()

  useEffect(() => {
    if (isEditingLocal && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditingLocal])

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsEditingLocal(true)
    setEditing(true)
    setEditText(cell.text)
  }

  const handleBlur = () => {
    setIsEditingLocal(false)
    setEditing(false)
    onTextChange(cell.id, editText)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsEditingLocal(false)
      setEditing(false)
      setEditText(cell.text)
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      setIsEditingLocal(false)
      setEditing(false)
      onTextChange(cell.id, editText)
    }
  }

  const getColorStyles = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string }> = {
      yellow: { bg: '#fef3c7', border: '#fcd34d' },
      blue: { bg: '#dbeafe', border: '#93c5fd' },
      pink: { bg: '#fbf1f5', border: '#f472b6' },
      green: { bg: '#f0fdf4', border: '#86efac' },
      purple: { bg: '#f3e8ff', border: '#d8b4fe' },
      orange: { bg: '#fef3c7', border: '#fdba74' },
    }
    return colorMap[color] || { bg: '#f3f4f6', border: '#e5e7eb' }
  }

  const colorStyles = getColorStyles(cell.color)

  return (
    <div
      className={`absolute w-48 h-48 shadow-lg rounded-sm p-4 ${!isDragging ? 'transition-all' : ''}`}
      style={{
        border: `2px solid ${colorStyles.border}`,
        backgroundColor: colorStyles.bg,
        top: `${cell.y}px`,
        left: `${cell.x}px`,
        transform: `rotate(${cell.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : isEditingLocal ? 'text' : 'grab',
        userSelect: isEditingLocal ? 'auto' : 'none',
      }}
      onMouseDown={(e) =>
        !isEditingLocal && onMouseDown(e, cell.id, cell.x, cell.y)
      }
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu?.(e, cell.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button */}
      {isHovered && !isEditingLocal && (
        <div className="absolute -top-2 -right-2 z-10">
          <DeleteButton onClick={() => onDelete(cell.id)} />
        </div>
      )}

      {isEditingLocal ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full text-sm text-neutral-700 bg-transparent border-0 outline-none resize-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <p className="text-sm text-neutral-700 whitespace-pre-wrap break-words m-0">
          {cell.text}
        </p>
      )}
    </div>
  )
}
