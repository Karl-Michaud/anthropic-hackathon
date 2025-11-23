'use client'

import { MouseEvent, useEffect, useRef } from 'react'
import { useDarkMode } from '../context/DarkModeContext'
import {
  colorsLight,
  colorsDark,
  borderRadius,
  shadows,
  brandColors,
} from '../styles/design-system'

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
  const { isDarkMode } = useDarkMode()
  const colors = isDarkMode ? colorsDark : colorsLight
  const menuRef = useRef<HTMLDivElement>(null)

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    // Add listener on next tick to avoid immediate close
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 10000,
        backgroundColor: isDarkMode
          ? brandColors.componentBackgroundDark
          : brandColors.componentBackground,
        borderRadius: borderRadius.md,
        boxShadow: shadows.lg,
        border: `1px solid ${colors.border.default}`,
        minWidth: '160px',
      }}
      onMouseDown={(e: MouseEvent) => e.stopPropagation()}
    >
      <button
        onClick={() => handleAction(onCopy)}
        style={{
          color: colors.text.primary,
          transition: 'background-color 0.15s ease',
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500 first:rounded-t-md flex justify-between items-center gap-4"
      >
        <span>Copy</span>
        <span
          style={{ color: colors.text.secondary }}
          className="text-xs font-mono"
        >
          ⌘C
        </span>
      </button>
      <button
        onClick={() => handleAction(onPaste)}
        disabled={isPasteDisabled}
        style={{
          color: colors.text.primary,
          transition: 'background-color 0.15s ease',
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center gap-4"
      >
        <span>Paste</span>
        <span
          style={{
            color: colors.text.secondary,
          }}
          className="text-xs font-mono"
        >
          ⌘V
        </span>
      </button>
      <button
        onClick={() => handleAction(onDelete)}
        style={{
          color: colors.text.primary,
          transition: 'background-color 0.15s ease',
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500 last:rounded-b-md flex justify-between items-center gap-4"
      >
        <span>Delete</span>
        <span
          style={{ color: colors.text.secondary }}
          className="text-xs font-mono"
        >
          ⌫
        </span>
      </button>
    </div>
  )
}
