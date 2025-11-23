'use client'

import { MouseEvent } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  onCopy: () => void
  onPaste: () => void
  onDelete: () => void
  isPasteDisabled: boolean
  onClose: () => void
}

export function ContextMenu({
  x,
  y,
  onCopy,
  onPaste,
  onDelete,
  isPasteDisabled,
  onClose,
}: ContextMenuProps) {
  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 10000,
      }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
      onMouseDown={(e: MouseEvent) => e.stopPropagation()}
    >
      <button
        onClick={() => handleAction(onCopy)}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Copy
      </button>
      <button
        onClick={() => handleAction(onPaste)}
        disabled={isPasteDisabled}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        Paste
      </button>
      <button
        onClick={() => handleAction(onDelete)}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Delete
      </button>
    </div>
  )
}
