'use client'

import { MouseEvent, useState, useRef, useEffect } from 'react'
import { useEditing } from '../context/EditingContext'
import { useDarkMode } from '../context/DarkModeContext'
import { CellData } from '../context/WhiteboardContext'
import DeleteButton from './common/DeleteButton'
import { colorsLight, colorsDark } from '../styles/design-system'

export type { CellData }

interface CellProps {
  cell: CellData
  isDragging: boolean
  isSelected?: boolean
  zoom: number
  zIndex?: number
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
  isSelected = false,
  zoom,
  zIndex = 1,
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
  const { isDarkMode } = useDarkMode()

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
    const colors = isDarkMode ? colorsDark : colorsLight
    const stickyColors = colors.sticky

    // Map old color names to new sticky colors
    const colorMapping: Record<string, keyof typeof stickyColors> = {
      yellow: 'mustard',
      blue: 'navy',
      pink: 'crail',
      green: 'olive',
      purple: 'purple',
      orange: 'teal',
    }

    const mappedColor = colorMapping[color] || 'mustard'
    return stickyColors[mappedColor] || stickyColors.mustard
  }

  // Calculate inverse-scaled border width (Figma-style)
  const outlineWidth = 2 / zoom
  const outlineOffset = 2 / zoom

  const colorStyles = getColorStyles(cell.color)
  const colors = isDarkMode ? colorsDark : colorsLight

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
        outline: isSelected
          ? `${outlineWidth}px solid ${colors.primary}`
          : 'none',
        outlineOffset: `${outlineOffset}px`,
        zIndex,
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
          style={{
            color: colors.text.primary,
          }}
          className="w-full h-full text-sm bg-transparent border-0 outline-none resize-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <p
          style={{
            color: colors.text.primary,
          }}
          className="text-sm whitespace-pre-wrap wrap-break-word m-0"
        >
          {cell.text}
        </p>
      )}
    </div>
  )
}
