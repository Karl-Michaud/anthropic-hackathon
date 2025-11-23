'use client'

import { X, Check, Loader2, Save, GripHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDarkMode } from '../context/DarkModeContext'
import type { FeedbackData, Question } from '../lib/dynamicFeedback'
import { brandColors, colorsLight, colorsDark } from '../styles/design-system'

// Question component - auto-resizing textarea with auto-save
function Question({
  question,
  value,
  onChange,
  placeholder = 'Type your answer here...',
  isDarkMode,
}: {
  question: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isDarkMode?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  // Auto-save indicator (visual feedback) - intentional setState in effect for UI feedback
  useEffect(() => {
    if (value.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSaving(true)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(false)
      }, 800)
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [value])

  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label
          className="block text-sm font-medium font-serif"
          style={{ color: colors.text.primary }}
        >
          {question}
        </label>
        {isSaving && (
          <div className="flex items-center gap-1 text-xs" style={{ color: brandColors.teal }}>
            <Save size={12} />
            Saving...
          </div>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border rounded-lg resize-none focus:ring-2 transition-all min-h-20"
        style={{
          backgroundColor: colors.background.paper,
          borderColor: brandColors.cloudy,
          color: colors.text.primary,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = brandColors.teal
        }}
        onBlur={(e) => {
          e.target.style.borderColor = brandColors.cloudy
        }}
        rows={3}
      />
      <div
        className="mt-1 text-xs"
        style={{ color: colors.text.secondary }}
      >
        {value.length} characters
        {value.length > 0 && value.length < 20 && (
          <span className="ml-2" style={{ color: colors.text.secondary }}>
            (add more details...)
          </span>
        )}
      </div>
    </div>
  )
}

// FeedbackSection component
function FeedbackSection({
  title,
  description,
  questions,
  isComplete,
  onAnswerChange,
  onComplete,
  isDarkMode,
}: {
  title: string
  description?: string
  questions: Question[]
  isComplete: boolean
  onAnswerChange: (questionId: string, answer: string) => void
  onComplete: () => void
  isDarkMode?: boolean
}) {
  const allQuestionsAnswered = questions.every(
    (q) => q.answer.trim().length > 0,
  )
  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <div
      className="border rounded-lg p-5 mb-4 transition-all"
      style={{
        borderColor: isComplete ? brandColors.teal : brandColors.cloudy,
        backgroundColor: colors.background.paper,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className="text-lg font-semibold mb-1 font-serif"
            style={{ color: colors.text.primary }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="text-sm font-serif"
              style={{ color: colors.text.secondary }}
            >
              {description}
            </p>
          )}
        </div>
        {isComplete && (
          <div className="flex items-center gap-2 ml-4" style={{ color: brandColors.teal }}>
            <Check size={20} />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <Question
            key={question.id}
            question={question.text}
            value={question.answer}
            onChange={(value) => onAnswerChange(question.id, value)}
            placeholder={question.placeholder}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {!isComplete && (
        <button
          onClick={onComplete}
          disabled={!allQuestionsAnswered}
          className="mt-4 w-full px-4 py-2 rounded-lg font-medium disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: allQuestionsAnswered ? brandColors.crail : brandColors.cloudy,
            color: brandColors.foregroundDark,
          }}
        >
          <Check size={16} />
          Mark as Complete
        </button>
      )}
    </div>
  )
}

// Main FeedbackPanel component
export default function FeedbackPanel({
  data,
  onClose,
  onSectionAnswerChange,
  onSectionComplete,
  onSubmitToAI,
}: {
  data: FeedbackData
  onClose: () => void
  onSectionAnswerChange: (
    sectionId: string,
    questionId: string,
    answer: string,
  ) => void
  onSectionComplete: (sectionId: string) => void
  onSubmitToAI: () => Promise<void> | void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const completedSections = data.sections.filter((s) => s.isComplete).length
  const totalSections = data.sections.length
  const allSectionsComplete = completedSections === totalSections

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmitToAI()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <div
      className="w-[600px] rounded-2xl shadow-lg flex flex-col max-h-[800px] transition-colors border"
      style={{
        backgroundColor: colors.background.paper,
        borderColor: brandColors.cloudy,
      }}
    >
      <div
        className="p-6 border-b shrink-0 relative flex items-center justify-between gap-4 group cursor-grab active:cursor-grabbing transition-colors"
        style={{
          backgroundColor: colors.background.paper,
          borderColor: brandColors.cloudy,
        }}
      >
        {/* Drag Handle */}
        <div
          data-drag-handle
          className="flex items-center justify-center shrink-0 p-1 rounded transition-all hover:opacity-75"
          style={{
            color: colors.text.secondary,
            cursor: 'grab',
          }}
          title="Drag to move this panel"
        >
          <GripHorizontal size={18} />
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-bold flex-1 min-w-0"
          style={{ color: colors.text.primary }}
        >
          {data.problemTitle}
        </h2>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="shrink-0 transition-colors"
          style={{ color: colors.text.secondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.secondary
          }}
          aria-label="Close feedback panel"
        >
          <X size={24} />
        </button>
      </div>

      <div
        className="p-6 overflow-y-auto flex-1 transition-colors"
        style={{ backgroundColor: colors.background.paper }}
      >
        {data.sections.map((section) => (
          <FeedbackSection
            key={section.id}
            title={section.title}
            description={section.description}
            questions={section.questions}
            isComplete={section.isComplete}
            onAnswerChange={(questionId, answer) =>
              onSectionAnswerChange(section.id, questionId, answer)
            }
            onComplete={() => onSectionComplete(section.id)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      <div
        className="p-6 border-t shrink-0 space-y-2 transition-colors"
        style={{
          backgroundColor: colors.background.paper,
          borderColor: brandColors.cloudy,
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={!allSectionsComplete || isSubmitting}
          className="w-full px-6 py-3 rounded-lg font-medium disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor:
              allSectionsComplete && !isSubmitting ? brandColors.crail : brandColors.cloudy,
            color: brandColors.foregroundDark,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enhancing Essay...
            </>
          ) : allSectionsComplete ? (
            <>
              <Check size={16} />
              Send to AI ✓ All Done
            </>
          ) : (
            `Send to AI (${completedSections}/${totalSections} complete)`
          )}
        </button>
        {!allSectionsComplete && (
          <p className="text-xs text-center" style={{ color: colors.text.secondary }}>
            Complete all sections to submit
          </p>
        )}
      </div>
    </div>
  )
}
