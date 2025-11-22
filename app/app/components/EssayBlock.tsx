'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Loader2, MoreVertical, Trash2 } from 'lucide-react'
import { useEditing } from '../context/EditingContext'
import { EssayData } from '../context/WhiteboardContext'
import { colors, typography, transitions } from '../styles/design-system'

export type { EssayData }

// WordCounter component
function WordCounter({
  currentCount,
  maxCount,
}: {
  currentCount: number
  maxCount?: number
}) {
  const isOverLimit = maxCount ? currentCount > maxCount : false
  const isNearLimit = maxCount ? currentCount > maxCount * 0.9 : false

  let color = colors.neutral[400]
  if (isOverLimit) {
    color = colors.danger[500]
  } else if (isNearLimit) {
    color = colors.warning[500]
  }

  const percentage = maxCount ? (currentCount / maxCount) * 100 : 0

  return (
    <div
      className="flex flex-col items-end gap-1"
      style={{ transition: transitions.common.colors }}
    >
      <span
        style={{
          fontSize: typography.sizes.xs,
          color: color,
          fontWeight: 500,
          letterSpacing: typography.letterSpacing.wide,
          transition: transitions.common.colors,
        }}
      >
        {currentCount}
        {maxCount && (
          <span style={{ color: colors.neutral[400] }}>/{maxCount}</span>
        )}
      </span>
      {maxCount && (
        <div
          style={{
            width: '100%',
            height: '2px',
            background: colors.neutral[200],
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(percentage, 100)}%`,
              background: isOverLimit
                ? colors.danger[500]
                : isNearLimit
                  ? colors.warning[500]
                  : colors.primary[500],
              transition: transitions.common.all,
            }}
          />
        </div>
      )}
    </div>
  )
}

// EssayMenu component
function EssayMenu({
  maxWords,
  onMaxWordsChange,
  onDelete,
}: {
  maxWords: string
  onMaxWordsChange: (value: string) => void
  onDelete: () => void
}) {
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
        className="p-1 hover:bg-neutral-200 rounded transition-colors cursor-pointer"
        title="Settings"
      >
        <MoreVertical size={16} className="text-neutral-400" />
      </button>

      {showMenu && (
        <div className="absolute top-8 right-0 bg-neutral-0 rounded-lg shadow-xl border border-neutral-200 py-2 z-50 min-w-[180px]">
          <div className="px-3 py-2 border-b border-neutral-100">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-neutral-600">Max words:</span>
              <input
                type="number"
                value={maxWords}
                onChange={(e) => onMaxWordsChange(e.target.value)}
                placeholder="None"
                className="w-16 px-2 py-1 border border-neutral-300 rounded text-neutral-900 text-xs"
              />
            </label>
          </div>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={14} />
            Delete Draft
          </button>
        </div>
      )}
    </div>
  )
}

// EssayDeleteConfirm component
function EssayDeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-0 bg-neutral-0/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
      <div className="text-center p-6">
        <p className="text-neutral-700 font-medium mb-4">Delete this draft?</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-danger-600 text-neutral-0 rounded-lg hover:bg-danger-700 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Main EssayBlock component
interface EssayBlockProps {
  data: EssayData
  scholarshipTitle?: string
  onUpdate: (data: EssayData) => void
  onDelete: (essayId: string) => void
  isGenerating?: boolean
}

export default function EssayBlock({
  data,
  scholarshipTitle,
  onUpdate,
  onDelete,
  isGenerating = false,
}: EssayBlockProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [maxWords, setMaxWords] = useState<string>(
    data.maxWordCount?.toString() || '',
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setEditing } = useEditing()

  const wordCount = useMemo(() => {
    return data.content.trim() ? data.content.trim().split(/\s+/).length : 0
  }, [data.content])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const minHeight = data.content ? 100 : 200
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, minHeight)}px`
    }
  }, [data.content])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...data, content: e.target.value })
  }

  const handleMaxWordsChange = (value: string) => {
    setMaxWords(value)
    const numValue = parseInt(value, 10)
    onUpdate({
      ...data,
      maxWordCount: isNaN(numValue) ? undefined : numValue,
    })
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onDelete(data.id)
    setShowDeleteConfirm(false)
  }

  return (
    <div className="w-[500px] bg-white rounded-xl shadow-lg border border-neutral-200 relative">
      <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 border-b border-neutral-200 rounded-t-xl">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-neutral-700 m-0">
            {scholarshipTitle ? `Draft for ${scholarshipTitle}` : 'Essay Draft'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <WordCounter currentCount={wordCount} maxCount={data.maxWordCount} />
          <EssayMenu
            maxWords={maxWords}
            onMaxWordsChange={handleMaxWordsChange}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {showDeleteConfirm && (
        <EssayDeleteConfirm
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <div className="p-4 relative">
        {isGenerating ? (
          <div className="flex items-center justify-center p-12 py-0">
            <Loader2 size={32} className="animate-spin text-primary-500" />
            <span className="ml-3 text-neutral-600">Generating essay...</span>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={data.content}
            onChange={handleContentChange}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            placeholder="Start writing your essay here..."
            className="w-full min-h-[200px] resize-none outline-none text-neutral-800 text-sm leading-relaxed overflow-hidden border-0 p-0"
          />
        )}
      </div>
    </div>
  )
}
