'use client'

import { X, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useDarkMode } from '../context/DarkModeContext'
import { brandColors, colorsLight, colorsDark } from '../styles/design-system'

export interface SocraticQuestion {
  id: string
  text: string
  answer: string
  tags?: string[]
}

export interface SocraticPanelData {
  id: string
  sectionId: string
  title: string
  hiddenWeightType?: string
  scholarshipPrompt?: string
  introText?: string
  questions: SocraticQuestion[]
}

interface SocraticPanelProps {
  data: SocraticPanelData
  onClose: () => void
  onAnswerChange: (questionId: string, answer: string) => void
  onSubmit: (answers: Record<string, string>) => Promise<void>
}

function Question({
  question,
  value,
  onChange,
  tags,
  isDarkMode = false,
}: {
  question: string
  value: string
  onChange: (value: string) => void
  tags?: string[]
  isDarkMode?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const colors = isDarkMode ? colorsDark : colorsLight

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="mb-6">
      <label
        className="block text-sm font-medium mb-2 font-serif"
        style={{ color: colors.text.primary }}
      >
        {question}
      </label>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-md text-xs font-medium"
              style={{
                backgroundColor: brandColors.navy,
                color: brandColors.foregroundDark,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Example of this field |"
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
      </div>
    </div>
  )
}

export default function SocraticPanel({
  data,
  onClose,
  onAnswerChange,
  onSubmit,
}: SocraticPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const isSubmitting = useRef(false)

  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const allQuestionsAnswered = data.questions.every(
    (q) => q.answer.trim().length > 0,
  )

  const handleSubmit = async () => {
    if (isSubmitting.current || !allQuestionsAnswered) return

    isSubmitting.current = true
    try {
      const answers = data.questions.reduce(
        (acc, q) => {
          acc[q.id] = q.answer
          return acc
        },
        {} as Record<string, string>,
      )
      await onSubmit(answers)
    } finally {
      isSubmitting.current = false
    }
  }

  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <div
      ref={panelRef}
      className="w-[500px] rounded-2xl shadow-2xl border flex flex-col absolute left-[540px] top-0 z-40"
      style={{
        backgroundColor: colors.background.paper,
        borderColor: brandColors.cloudy,
      }}
    >
      <div
        className="p-6 shrink-0 relative rounded-2xl"
        style={{
          backgroundColor: colors.background.paper,
          borderColor: brandColors.cloudy,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: colors.text.secondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.secondary
          }}
          aria-label="Close socratic panel"
        >
          <X size={24} />
        </button>
        {data.hiddenWeightType && (
          <div className="mb-3 flex items-center gap-2">
            <span
              className="text-sm font-medium font-serif"
              style={{ color: colors.text.primary }}
            >
              Hidden Weight Type:
            </span>
            <span
              className="px-3 py-1 rounded-md text-xs font-medium"
              style={{
                backgroundColor: brandColors.navy,
                color: brandColors.foregroundDark,
              }}
            >
              {data.hiddenWeightType}
            </span>
          </div>
        )}
        <h2
          className="text-2xl font-bold pr-10 font-serif"
          style={{ color: colors.text.primary }}
        >
          {data.title}
        </h2>
        {data.scholarshipPrompt && (
          <div className="mt-4">
            <div
              className="text-xs font-medium mb-2"
              style={{ color: colors.text.secondary }}
            >
              From the Scholarship Prompt
            </div>
            <div
              className="p-4 rounded-lg border-l-4 italic text-sm"
              style={{
                backgroundColor: colors.background.elevated,
                borderLeftColor: brandColors.cloudy,
                color: colors.text.primary,
              }}
            >
              {data.scholarshipPrompt}
            </div>
          </div>
        )}
        {data.introText && (
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: colors.text.primary }}
          >
            {data.introText}
          </p>
        )}
      </div>

      <div
        className="p-6 overflow-y-auto flex-1"
        style={{ backgroundColor: colors.background.paper }}
      >
        {data.questions.map((question) => (
          <Question
            key={question.id}
            question={question.text}
            value={question.answer}
            onChange={(value) => onAnswerChange(question.id, value)}
            tags={question.tags}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      <div
        className="p-6 shrink-0 rounded-2xl"
        style={{
          backgroundColor: colors.background.paper,
          borderColor: brandColors.cloudy,
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered || isSubmitting.current}
          className="w-full px-6 py-3 rounded-lg font-medium disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor:
              allQuestionsAnswered && !isSubmitting.current
                ? brandColors.teal
                : brandColors.cloudy,
            color: brandColors.foregroundDark,
          }}
        >
          {isSubmitting.current ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Updating essay...
            </>
          ) : (
            'Update Essay'
          )}
        </button>
      </div>
    </div>
  )
}
