'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { MoreVertical, Loader2, Trash2 } from 'lucide-react'
import WordCounter from './WordCounter'
import { useEditing } from '../../context/EditingContext'

export interface EssayData {
  id: string
  scholarshipId: string
  content: string
  maxWordCount?: number
}

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
  const [showSettings, setShowSettings] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [maxWords, setMaxWords] = useState<string>(data.maxWordCount?.toString() || '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const { setEditing } = useEditing()

  const wordCount = useMemo(() => {
    return data.content.trim() ? data.content.trim().split(/\s+/).length : 0
  }, [data.content])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const minHeight = data.content ? 100 : 200
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, minHeight)}px`
    }
  }, [data.content])

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
    }
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...data, content: e.target.value })
  }

  const handleMaxWordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
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
    setShowSettings(false)
  }

  return (
    <div className="w-[500px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-visible relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-xl">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-700">
            {scholarshipTitle ? `Draft for ${scholarshipTitle}` : 'Essay Draft'}
          </h3>
        </div>
        <div className="flex items-center gap-3 relative" ref={settingsRef}>
          <WordCounter currentCount={wordCount} maxCount={data.maxWordCount} />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Settings"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="absolute top-8 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]">
              <div className="px-3 py-2 border-b border-gray-100">
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Max words:</span>
                  <input
                    type="number"
                    value={maxWords}
                    onChange={handleMaxWordsChange}
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
          <div className="text-center p-6">
            <p className="text-gray-700 font-medium mb-4">Delete this draft?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 relative">
        {isGenerating ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Generating essay...</span>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={data.content}
            onChange={handleContentChange}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            placeholder="Start writing your essay here..."
            className="w-full min-h-[200px] resize-none outline-none text-gray-800 text-sm leading-relaxed placeholder:text-gray-400 overflow-hidden"
          />
        )}
      </div>
    </div>
  )
}
