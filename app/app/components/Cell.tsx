'use client'

import { MouseEvent, useState, useRef, useEffect } from 'react'
import { useEditing } from '../context/EditingContext'
import { CellData } from '../context/WhiteboardContext'

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
  onTextChange: (cellId: string, newText: string) => void
}

export default function Cell({
  cell,
  isDragging,
  onMouseDown,
  onTextChange,
}: CellProps) {
  const [isEditingLocal, setIsEditingLocal] = useState(false)
  const [editText, setEditText] = useState(cell.text)
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

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-100 border-yellow-200',
      blue: 'bg-blue-100 border-blue-200',
      pink: 'bg-pink-100 border-pink-200',
      green: 'bg-green-100 border-green-200',
      purple: 'bg-purple-100 border-purple-200',
      orange: 'bg-orange-100 border-orange-200',
    }
    return colors[color] || 'bg-gray-100 border-gray-200'
  }

  return (
    <div
      className={`absolute w-48 h-48 shadow-lg rounded-sm p-4 border hover:rotate-0 transition-transform ${isEditingLocal ? '' : 'select-none'} ${getColorClasses(cell.color)}`}
      style={{
        top: `${cell.y}px`,
        left: `${cell.x}px`,
        transform: `rotate(${cell.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : isEditingLocal ? 'text' : 'grab',
      }}
      onMouseDown={(e) => !isEditingLocal && onMouseDown(e, cell.id, cell.x, cell.y)}
      onDoubleClick={handleDoubleClick}
    >
      {isEditingLocal ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {cell.text}
        </p>
      )}
    </div>
  )
}
