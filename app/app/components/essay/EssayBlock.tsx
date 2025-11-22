'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import WordCounter from './WordCounter'
import EssayMenu from './EssayMenu'
import EssayDeleteConfirm from './EssayDeleteConfirm'
import { useEditing } from '../../context/EditingContext'
import { EssayData } from '../../context/WhiteboardContext'

export type { EssayData }

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

  // Auto-resize textarea
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
      {/* Header */}
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

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <EssayDeleteConfirm
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Content */}
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
