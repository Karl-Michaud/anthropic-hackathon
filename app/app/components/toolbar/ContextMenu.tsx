import { useEffect, useRef } from 'react'
import { Copy, Trash2, Clipboard } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  onCopy: () => void
  onPaste: () => void
  onDelete: () => void
  onClose: () => void
  hasSelection: boolean
}

export default function ContextMenu({
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
      className="fixed z-[100] bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1.5 min-w-[160px] select-none"
      style={{ left: x, top: y }}
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
          hasSelection
            ? 'hover:bg-gray-700 text-gray-100 cursor-pointer'
            : 'text-gray-500 cursor-not-allowed'
        }`}
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
        className="w-full px-4 py-2.5 text-left hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-100 font-medium transition-colors cursor-pointer"
      >
        <Clipboard size={16} />
        Paste
      </button>
      <div className="border-t border-gray-700 my-1" />
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
          hasSelection
            ? 'hover:bg-red-900/50 text-red-400 cursor-pointer'
            : 'text-gray-600 cursor-not-allowed'
        }`}
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  )
}
