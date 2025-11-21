'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Trash2 } from 'lucide-react'

interface EssayMenuProps {
  maxWords: string
  onMaxWordsChange: (value: string) => void
  onDelete: () => void
}

export default function EssayMenu({
  maxWords,
  onMaxWordsChange,
  onDelete,
}: EssayMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleDelete = () => {
    setShowMenu(false)
    onDelete()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 hover:bg-gray-200 rounded transition-colors"
        title="Settings"
      >
        <MoreVertical size={16} className="text-gray-400" />
      </button>

      {showMenu && (
        <div className="absolute top-8 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]">
          <div className="px-3 py-2 border-b border-gray-100">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Max words:</span>
              <input
                type="number"
                value={maxWords}
                onChange={(e) => onMaxWordsChange(e.target.value)}
                placeholder="None"
                className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs"
              />
            </label>
          </div>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={14} />
            Delete Draft
          </button>
        </div>
      )}
    </div>
  )
}
