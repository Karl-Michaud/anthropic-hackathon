'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Loader2,
  MoreVertical,
  Trash2,
  Download,
  FileText,
  FileType,
  File,
  Sparkles,
} from 'lucide-react'
import { exportEssay, ExportFormat } from '../lib/exportUtils'
import { useEditing } from '../context/EditingContext'
import { useDarkMode } from '../context/DarkModeContext'
import { EssayData, HighlightedSection, CustomDraftAnalysis } from '../context/WhiteboardContext'
import { brandColors, typography, transitions } from '../styles/design-system'
import SocraticPanel, { SocraticPanelData } from './SocraticPanel'
import { submitSocraticAnswers } from '@/app/lib/dynamicFeedback'

export type { EssayData }

// Highlight color map - using brandColors for consistency
const HIGHLIGHT_COLORS: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  amber: {
    bg: brandColors.mustard,
    text: brandColors.foreground,
    ring: brandColors.clay,
  },
  cyan: {
    bg: brandColors.teal,
    text: brandColors.foregroundDark,
    ring: brandColors.navy,
  },
  pink: {
    bg: brandColors.crail,
    text: brandColors.foregroundDark,
    ring: brandColors.maroon,
  },
  lime: {
    bg: brandColors.olive,
    text: brandColors.foregroundDark,
    ring: brandColors.clay,
  },
  purple: {
    bg: brandColors.purple,
    text: brandColors.foregroundDark,
    ring: brandColors.magenta,
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
    const colorConfig =
      HIGHLIGHT_COLORS[section.colorName] || HIGHLIGHT_COLORS.amber
    elements.push(
      <mark
        key={`highlight-${section.id}`}
        onClick={(e) => {
          e.stopPropagation()
          onSectionClick(section)
        }}
        className="cursor-pointer transition-all"
        style={{
          backgroundColor: colorConfig.bg,
          color: colorConfig.text,
          padding: '0.25rem',
          borderRadius: '0.25rem',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${colorConfig.ring}`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
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

  let color = brandColors.cloudy
  if (isOverLimit) {
    color = brandColors.maroon
  } else if (isNearLimit) {
    color = brandColors.mustard
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
          <span style={{ color: brandColors.cloudy }}>/{maxCount}</span>
        )}
      </span>
      {maxCount && (
        <div
          style={{
            width: '100%',
            height: '2px',
            background: brandColors.cloudy,
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(percentage, 100)}%`,
              background: isOverLimit
                ? brandColors.maroon
                : isNearLimit
                  ? brandColors.mustard
                  : brandColors.teal,
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
  isDarkMode = false,
}: {
  maxWords: string
  onMaxWordsChange: (value: string) => void
  onDelete: () => void
  isDarkMode?: boolean
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
        <div
          className={`absolute top-8 right-0 rounded-lg shadow-xl border py-2 z-50 min-w-[180px] ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div
            className={`px-3 py-2 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            }`}
          >
            <label className="flex items-center gap-2 text-sm">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Max words:
              </span>
              <input
                type="number"
                value={maxWords}
                onChange={(e) => onMaxWordsChange(e.target.value)}
                placeholder="None"
                className={`w-16 px-2 py-1 border rounded text-xs ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              />
            </label>
          </div>
          <button
            onClick={handleDelete}
            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer ${
              isDarkMode
                ? 'text-red-400 hover:bg-red-900/30'
                : 'text-red-600 hover:bg-red-50'
            }`}
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

// CustomDraftAnalysisDisplay component
function CustomDraftAnalysisDisplay({
  analysis,
  isDarkMode = false,
}: {
  analysis: CustomDraftAnalysis
  isDarkMode?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Helper function to get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return isDarkMode ? '#10b981' : '#059669' // green
    if (score >= 60) return isDarkMode ? '#f59e0b' : '#d97706' // amber
    return isDarkMode ? '#ef4444' : '#dc2626' // red
  }

  return (
    <div
      className={`mt-4 border-t pt-4 transition-colors duration-200 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left flex items-center justify-between px-2 py-2 rounded transition-colors cursor-pointer ${
          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <h4
            className={`text-sm font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            📊 Alignment Analysis
          </h4>
          <span
            className="text-lg font-bold"
            style={{ color: getScoreColor(analysis.overall_alignment_score) }}
          >
            {analysis.overall_alignment_score}%
          </span>
        </div>
        <span
          className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* Summary */}
          <div
            className={`p-3 rounded text-sm ${
              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-gray-700'
            }`}
          >
            <p className="font-medium mb-1">Summary</p>
            <p className="text-xs leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key Strengths */}
          {analysis.key_strengths.length > 0 && (
            <div>
              <p
                className={`text-xs font-semibold mb-2 ${
                  isDarkMode ? 'text-green-400' : 'text-green-700'
                }`}
              >
                ✓ Key Strengths
              </p>
              <ul className="space-y-1">
                {analysis.key_strengths.map((strength, idx) => (
                  <li
                    key={idx}
                    className={`text-xs pl-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    style={{ listStyle: 'disc', listStylePosition: 'inside' }}
                  >
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Improvements */}
          {analysis.critical_improvements.length > 0 && (
            <div>
              <p
                className={`text-xs font-semibold mb-2 ${
                  isDarkMode ? 'text-red-400' : 'text-red-700'
                }`}
              >
                ⚠ Critical Improvements
              </p>
              <ul className="space-y-1">
                {analysis.critical_improvements.map((improvement, idx) => (
                  <li
                    key={idx}
                    className={`text-xs pl-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    style={{ listStyle: 'disc', listStylePosition: 'inside' }}
                  >
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Scores */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-2 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Personality
              </p>
              <p
                className="text-lg font-bold"
                style={{
                  color: getScoreColor(analysis.personality_alignment.score),
                }}
              >
                {analysis.personality_alignment.score}%
              </p>
            </div>

            <div
              className={`p-2 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Priorities
              </p>
              <p
                className="text-lg font-bold"
                style={{
                  color: getScoreColor(analysis.priorities_alignment.score),
                }}
              >
                {analysis.priorities_alignment.score}%
              </p>
            </div>

            <div
              className={`p-2 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Values
              </p>
              <p
                className="text-lg font-bold"
                style={{
                  color: getScoreColor(analysis.values_alignment.score),
                }}
              >
                {analysis.values_alignment.score}%
              </p>
            </div>

            <div
              className={`p-2 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Criteria
              </p>
              <p
                className="text-lg font-bold"
                style={{
                  color: getScoreColor(analysis.weights_alignment.score),
                }}
              >
                {analysis.weights_alignment.score}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// EssayDeleteConfirm component
function EssayDeleteConfirm({
  onConfirm,
  onCancel,
  isDarkMode = false,
}: {
  onConfirm: () => void
  onCancel: () => void
  isDarkMode?: boolean
}) {
  return (
    <div
      className={`absolute inset-0 backdrop-blur-sm rounded-xl flex items-center justify-center z-50 ${
        isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'
      }`}
    >
      <div className="text-center p-6">
        <p
          className={`font-medium mb-4 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Delete this draft?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
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
  userId?: string
  onSubmitForReview?: (essayId: string) => Promise<void>
}

export default function EssayBlock({
  data,
  scholarshipTitle,
  onUpdate,
  onDelete,
  isGenerating = false,
  onGenerateSocraticQuestions,
  userId,
  onSubmitForReview,
}: EssayBlockProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [maxWords, setMaxWords] = useState<string>(
    data.maxWordCount?.toString() || '',
  )
  const [selectedSection, setSelectedSection] =
    useState<HighlightedSection | null>(null)
  const [isEditMode, setIsEditMode] = useState(true)
  const [textareaHeight, setTextareaHeight] = useState<number>(100)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)
  const { setEditing } = useEditing()
  const { isDarkMode } = useDarkMode()

  const wordCount = useMemo(() => {
    return data.content.trim() ? data.content.trim().split(/\s+/).length : 0
  }, [data.content])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${newHeight}px`
      setTextareaHeight(newHeight)
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

  // Automatically exit edit mode when highlights are generated
  useEffect(() => {
    if (data.highlightedSections && data.highlightedSections.length > 0) {
      setIsEditMode(false)
    }
  }, [data.highlightedSections])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    console.log('📝 [EssayBlock.handleContentChange] Content changed')
    console.log('  - Essay ID:', data.id)
    console.log('  - Is custom draft:', data.isCustomDraft)
    console.log('  - New content length:', newContent.length)
    console.log('  - New word count:', newContent.trim().split(/\s+/).length)

    // Switch to edit mode when content changes
    setIsEditMode(true)
    setSelectedSection(null)
    setSubmitError(null) // Clear any previous submit errors

    // Clear highlights and socratic data when content changes
    onUpdate({
      ...data,
      content: newContent,
      highlightedSections: undefined,
      socraticData: undefined,
      customDraftAnalysis: undefined, // Clear custom draft analysis too
      lastEditedAt: Date.now(),
    })

    // IMPORTANT: Do NOT auto-trigger for custom drafts
    // Custom drafts require manual submission via "Submit for Review" button
    if (data.isCustomDraft) {
      console.log('  - ⚠️ Skipping auto-analysis (custom draft - manual submission required)')
      return
    }

    // Trigger regeneration for AI-generated drafts only
    if (onGenerateSocraticQuestions) {
      console.log('  - ✅ Triggering auto-analysis (AI-generated draft)')
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
        userId,
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

  const handleSubmitForReview = async () => {
    if (!onSubmitForReview) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('🔘 [EssayBlock] Submit for Review button clicked')
      await onSubmitForReview(data.id)
      console.log('✅ [EssayBlock] Submit successful')
    } catch (error) {
      console.error('❌ [EssayBlock] Submit error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit for review'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
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
    <div className="relative">
      <div
        className={`w-[500px] rounded-xl shadow-lg transition-colors duration-200 ${
          isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-neutral-200'
        }`}
        ref={blockRef}
      >
        <div
          className={`flex items-center justify-between py-3 px-4 border-b rounded-t-xl transition-colors duration-200 ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex-1">
            <h3
              className={`text-sm font-semibold m-0 ${
                isDarkMode ? 'text-gray-100' : 'text-neutral-700'
              }`}
            >
              {scholarshipTitle
                ? `Draft for ${scholarshipTitle}`
                : 'Essay Draft'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <WordCounter
              currentCount={wordCount}
              maxCount={data.maxWordCount}
            />
            <ExportMenu
              content={data.content}
              filename={
                scholarshipTitle ? `essay_${scholarshipTitle}` : 'essay_draft'
              }
              title={
                scholarshipTitle
                  ? `Draft for ${scholarshipTitle}`
                  : 'Essay Draft'
              }
              disabled={isGenerating}
            />
            <EssayMenu
              maxWords={maxWords}
              onMaxWordsChange={handleMaxWordsChange}
              onDelete={handleDelete}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {showDeleteConfirm && (
          <EssayDeleteConfirm
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteConfirm(false)}
            isDarkMode={isDarkMode}
          />
        )}

        <div className="p-4 relative">
          {isGenerating ? (
            <div className="flex items-center justify-center p-12 py-0">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <span
                className={`ml-3 ${isDarkMode ? 'text-gray-400' : 'text-neutral-600'}`}
              >
                Generating essay...
              </span>
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
              onWheel={(e) => e.stopPropagation()}
              placeholder="Start writing your essay here..."
              className={`w-full resize-none outline-none text-sm leading-relaxed border-0 p-0 transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-100 placeholder-gray-500'
                  : 'bg-white text-neutral-800 placeholder-gray-400'
              }`}
              style={{
                minHeight: '100px',
                height: `${textareaHeight}px`,
              }}
            />
          ) : (
            <div
              className={`w-full border-0 p-0 text-sm leading-relaxed transition-colors cursor-pointer opacity-75 ${
                isDarkMode ? 'text-gray-100' : 'text-neutral-800'
              }`}
              onDoubleClick={() => setIsEditMode(true)}
              onWheel={(e) => e.stopPropagation()}
              title="Double-click to edit"
            >
              {renderHighlightedText(
                data.content,
                data.highlightedSections,
                handleSectionClick,
              )}
            </div>
          )}

          {/* Submit for Review Button - Only for custom drafts without analysis */}
          {data.isCustomDraft &&
            !data.customDraftAnalysis &&
            !isGenerating &&
            onSubmitForReview && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || wordCount < 50}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isSubmitting || wordCount < 50
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md cursor-pointer'
                  }`}
                  style={{
                    backgroundColor: brandColors.teal,
                    color: '#ffffff',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting for Review...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Submit for Review {wordCount < 50 && `(${wordCount}/50 words)`}
                    </>
                  )}
                </button>
                {submitError && (
                  <p className="mt-2 text-xs text-red-600">{submitError}</p>
                )}
                {wordCount < 50 && !submitError && (
                  <p
                    className={`mt-2 text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Write at least 50 words to submit for comprehensive analysis
                  </p>
                )}
              </div>
            )}

          {/* Custom Draft Analysis */}
          {data.isCustomDraft && data.customDraftAnalysis && (
            <CustomDraftAnalysisDisplay
              analysis={data.customDraftAnalysis}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
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
