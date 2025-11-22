'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Loader2, MoreVertical, Trash2, Download, FileText, FileType, File } from 'lucide-react'
import { exportEssay, ExportFormat } from '../lib/exportUtils'
import { useEditing } from '../context/EditingContext'
import {
  EssayData,
  HighlightedSection,
  SocraticQuestion,
} from '../context/WhiteboardContext'
import { colors, typography, transitions } from '../styles/design-system'
import SocraticPanel, { SocraticPanelData } from './SocraticPanel'
import {
  analyzeSocraticQuestions,
  submitSocraticAnswers,
} from './DynamicFeedback'

export type { EssayData }

// Highlight color map
const HIGHLIGHT_COLORS: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    ring: 'ring-amber-500',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-900',
    ring: 'ring-cyan-500',
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-900',
    ring: 'ring-pink-500',
  },
  lime: {
    bg: 'bg-lime-100',
    text: 'text-lime-900',
    ring: 'ring-lime-500',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    ring: 'ring-purple-500',
  },
}

// Helper to render text with highlights
function renderHighlightedText(
  text: string,
  sections: HighlightedSection[],
  onSectionClick: (section: HighlightedSection) => void,
) {
  if (!sections || sections.length === 0) {
    return <span>{text}</span>
  }

  // Sort sections by start index
  const sorted = [...sections].sort((a, b) => a.startIndex - b.startIndex)

  const elements = []
  let lastIndex = 0

  for (const section of sorted) {
    // Add text before highlight
    if (lastIndex < section.startIndex) {
      elements.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, section.startIndex)}
        </span>,
      )
    }

    // Add highlighted text
    const colorConfig = HIGHLIGHT_COLORS[section.colorName]
    elements.push(
      <mark
        key={`highlight-${section.id}`}
        onClick={() => onSectionClick(section)}
        className={`${colorConfig.bg} ${colorConfig.text} cursor-pointer px-1 rounded transition-all hover:ring-2 ${colorConfig.ring}`}
        title={section.title}
      >
        {text.substring(section.startIndex, section.endIndex)}
      </mark>,
    )

    lastIndex = section.endIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(
      <span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>,
    )
  }

  return <>{elements}</>
}

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
        <div className="absolute top-8 right-0 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 min-w-[180px]">
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

// ExportMenu component
function ExportMenu({
  content,
  filename,
  title,
  disabled,
}: {
  content: string
  filename: string
  title?: string
  disabled?: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
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

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    try {
      await exportEssay(content, filename, format, title)
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error)
    } finally {
      setIsExporting(false)
      setShowMenu(false)
    }
  }

  const exportOptions = [
    { format: 'txt' as ExportFormat, label: 'Text (.txt)', icon: FileText },
    { format: 'pdf' as ExportFormat, label: 'PDF (.pdf)', icon: File },
    { format: 'docx' as ExportFormat, label: 'Word (.docx)', icon: FileType },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || !content.trim()}
        className={`p-1 rounded transition-colors cursor-pointer ${
          disabled || !content.trim()
            ? 'text-neutral-300 cursor-not-allowed'
            : 'hover:bg-neutral-200 text-neutral-400'
        }`}
        title="Export essay"
      >
        {isExporting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
      </button>

      {showMenu && (
        <div className="absolute top-8 right-0 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 min-w-[160px]">
          {exportOptions.map(({ format, label, icon: Icon }) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
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
  onGenerateSocraticQuestions?: (essayId: string) => Promise<void>
}

export default function EssayBlock({
  data,
  scholarshipTitle,
  onUpdate,
  onDelete,
  isGenerating = false,
  onGenerateSocraticQuestions,
}: EssayBlockProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [maxWords, setMaxWords] = useState<string>(
    data.maxWordCount?.toString() || '',
  )
  const [selectedSection, setSelectedSection] =
    useState<HighlightedSection | null>(null)
  const [isEditMode, setIsEditMode] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)
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

  // Handle clicks outside highlights to close the Socratic panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if click is on a highlight
      if (target.closest('mark')) return
      // Check if click is on the Socratic panel
      if (target.closest('[data-socratic-panel]')) return
      // Close the panel
      setSelectedSection(null)
    }

    if (selectedSection) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedSection])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    // Switch to edit mode when content changes
    setIsEditMode(true)
    setSelectedSection(null)

    // Clear highlights and socratic data when content changes
    onUpdate({
      ...data,
      content: newContent,
      highlightedSections: undefined,
      socraticData: undefined,
      lastEditedAt: Date.now(),
    })
    // Trigger regeneration
    if (onGenerateSocraticQuestions) {
      onGenerateSocraticQuestions(data.id)
    }
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

  const handleSectionClick = (section: HighlightedSection) => {
    setSelectedSection(section)
  }

  const handleSocraticAnswerChange = (questionId: string, answer: string) => {
    if (!selectedSection) return

    const updatedSocraticData = { ...data.socraticData }
    if (!updatedSocraticData[selectedSection.id]) {
      updatedSocraticData[selectedSection.id] = []
    }

    const questionIndex = updatedSocraticData[selectedSection.id].findIndex(
      (q) => q.id === questionId,
    )
    if (questionIndex !== -1) {
      updatedSocraticData[selectedSection.id][questionIndex].answer = answer
    }

    onUpdate({
      ...data,
      socraticData: updatedSocraticData,
    })
  }

  const handleSocraticSubmit = async (answers: Record<string, string>) => {
    if (!selectedSection) return

    try {
      // Submit the Socratic answers to update the essay
      const updatedContent = await submitSocraticAnswers(
        data.content,
        selectedSection.id,
        answers,
      )

      // Clear the selected section
      setSelectedSection(null)

      // Update the essay with the new content
      onUpdate({
        ...data,
        content: updatedContent,
        highlightedSections: undefined,
        socraticData: undefined,
      })

      // Trigger regeneration of highlights and questions
      if (onGenerateSocraticQuestions) {
        await onGenerateSocraticQuestions(data.id)
      }
    } catch (error) {
      console.error('Error submitting Socratic answers:', error)
    }
  }

  const socraticPanelData: SocraticPanelData | null = selectedSection
    ? {
        id: `socratic-${selectedSection.id}`,
        sectionId: selectedSection.id,
        title: selectedSection.title,
        questions: data.socraticData?.[selectedSection.id] || [],
      }
    : null

  return (
    <div
      className="w-[500px] bg-white rounded-xl shadow-lg border border-neutral-200 relative"
      ref={blockRef}
    >
      <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 border-b border-neutral-200 rounded-t-xl">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-neutral-700 m-0">
            {scholarshipTitle ? `Draft for ${scholarshipTitle}` : 'Essay Draft'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <WordCounter currentCount={wordCount} maxCount={data.maxWordCount} />
          <ExportMenu
            content={data.content}
            filename={scholarshipTitle ? `essay_${scholarshipTitle}` : 'essay_draft'}
            title={scholarshipTitle ? `Draft for ${scholarshipTitle}` : 'Essay Draft'}
            disabled={isGenerating}
          />
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
        ) : isEditMode ||
          !data.highlightedSections ||
          data.highlightedSections.length === 0 ? (
          <textarea
            ref={textareaRef}
            value={data.content}
            onChange={handleContentChange}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            placeholder="Start writing your essay here..."
            className="w-full min-h-[200px] max-h-[500px] resize-none outline-none text-neutral-800 text-sm leading-relaxed overflow-y-auto border-0 p-0"
          />
        ) : (
          <div
            className="w-full min-h-[200px] max-h-[500px] overflow-y-auto border-0 p-0 text-neutral-800 text-sm leading-relaxed cursor-pointer"
            onClick={() => setIsEditMode(true)}
          >
            {renderHighlightedText(
              data.content,
              data.highlightedSections,
              handleSectionClick,
            )}
          </div>
        )}
      </div>

      {socraticPanelData && (
        <div data-socratic-panel>
          <SocraticPanel
            data={socraticPanelData}
            onClose={() => setSelectedSection(null)}
            onAnswerChange={handleSocraticAnswerChange}
            onSubmit={handleSocraticSubmit}
          />
        </div>
      )}
    </div>
  )
}
