'use client'

import { X, Check, Loader2, Save, GripHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDarkMode } from '../context/DarkModeContext'
import type { FeedbackData, Question } from '../lib/dynamicFeedback'
import { colors } from '../styles/design-system'

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

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-neutral-700'
          }`}
        >
          {question}
        </label>
        {isSaving && (
          <div className="flex items-center gap-1 text-xs text-primary-600">
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
        className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all min-h-20 ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500'
            : 'bg-white border-neutral-300 text-neutral-900'
        }`}
        rows={3}
      />
      <div
        className={`mt-1 text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-neutral-500'
        }`}
      >
        {value.length} characters
        {value.length > 0 && value.length < 20 && (
          <span
            className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-neutral-400'}`}
          >
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

  return (
    <div
      className={`border rounded-lg p-5 mb-4 transition-all ${
        isComplete
          ? isDarkMode
            ? 'border-primary-500 bg-gray-700'
            : 'border-primary-500 bg-primary-50'
          : isDarkMode
            ? 'border-gray-600 bg-gray-800'
            : 'border-neutral-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold mb-1 ${
              isDarkMode ? 'text-gray-100' : 'text-neutral-900'
            }`}
          >
            {title}
          </h3>
          {description && (
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-neutral-600'
              }`}
            >
              {description}
            </p>
          )}
        </div>
        {isComplete && (
          <div className="flex items-center gap-2 text-primary-600 ml-4">
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
          className="mt-4 w-full text-white px-4 py-2 rounded-lg font-medium disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: allQuestionsAnswered ? '#C15F3C' : undefined,
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

  return (
    <div
      className={`w-[600px] rounded-2xl shadow-lg flex flex-col max-h-[800px] transition-colors border ${
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'border-[#B1ADA1]'
      }`}
      style={{
        backgroundColor: isDarkMode ? undefined : '#FDFBF9',
      }}
    >
      <div
        className={`p-6 border-b shrink-0 relative flex items-center justify-between gap-4 group cursor-grab active:cursor-grabbing transition-colors ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-neutral-200'
        }`}
      >
        {/* Drag Handle */}
        <div
          data-drag-handle
          className="flex items-center justify-center shrink-0 p-1 rounded transition-all hover:opacity-75"
          style={{
            color: isDarkMode ? colors.neutral[400] : colors.neutral[500],
            cursor: 'grab',
          }}
          title="Drag to move this panel"
        >
          <GripHorizontal size={18} />
        </div>

        {/* Title */}
        <h2
          className={`text-2xl font-bold flex-1 min-w-0 ${
            isDarkMode ? 'text-gray-100' : 'text-neutral-900'
          }`}
        >
          {data.problemTitle}
        </h2>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`shrink-0 transition-colors ${
            isDarkMode
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
          aria-label="Close feedback panel"
        >
          <X size={24} />
        </button>
      </div>

      <div
        className={`p-6 overflow-y-auto flex-1 transition-colors ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
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
        className={`p-6 border-t shrink-0 space-y-2 transition-colors ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-neutral-200'
        }`}
      >
        <button
          onClick={handleSubmit}
          disabled={!allSectionsComplete || isSubmitting}
          className="w-full text-white px-6 py-3 rounded-lg font-medium disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: allSectionsComplete && !isSubmitting ? '#C15F3C' : undefined,
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
          <p className="text-xs text-neutral-500 text-center">
            Complete all sections to submit
          </p>
        )}
      </div>
    </div>
  )
}
