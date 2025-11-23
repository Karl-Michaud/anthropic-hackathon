'use client'

import { X } from 'lucide-react'
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
  explanation?: string
  hiddenWeightType?: string
  scholarshipPrompt?: string
  introText?: string
  questions: SocraticQuestion[]
  areasOfImprovement?: string[] // For custom drafts
  propertyType?: 'personality' | 'value' | 'weight' | 'priority' // Type of property being addressed
  propertyValue?: string // The specific property value
}

interface SocraticPanelProps {
  data: SocraticPanelData
  onClose: () => void
  onAnswerChange: (questionId: string, answer: string) => void
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
        placeholder="type response here..."
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
      <div className="mt-1 text-xs" style={{ color: colors.text.secondary }}>
        {value.length} characters
      </div>
    </div>
  )
}

export default function SocraticPanel({
  data,
  onClose,
  onAnswerChange,
}: SocraticPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { isDarkMode } = useDarkMode()

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
        {/* Property Type and Value Display */}
        {data.propertyType && data.propertyValue && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-md text-xs font-medium capitalize"
                style={{
                  backgroundColor: brandColors.navy,
                  color: brandColors.foregroundDark,
                }}
              >
                {data.propertyValue}
              </span>
            </div>
          </div>
        )}
        {/* Legacy support for hiddenWeightType */}
        {!data.propertyType && data.hiddenWeightType && (
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
        className="p-6 overflow-y-auto flex-1 rounded-2xl"
        style={{ backgroundColor: colors.background.paper }}
      >
        {data.explanation && (
          <div className="mb-6">
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: colors.text.secondary }}
            >
              From your response
            </p>
            <div
              className="pl-4 py-3 border-l-4 italic"
              style={{
                borderColor: brandColors.teal,
                backgroundColor: isDarkMode ? '#262624' : brandColors.pampas,
                color: isDarkMode ? colors.text.secondary : colors.text.primary,
              }}
            >
              <p className="text-sm leading-relaxed">{data.explanation}</p>
            </div>
          </div>
        )}

        {/* Display questions for auto-generated essays */}
        {data.questions &&
          data.questions.length > 0 &&
          data.questions.map((question) => (
            <Question
              key={question.id}
              question={question.text}
              value={question.answer}
              onChange={(value) => onAnswerChange(question.id, value)}
              tags={question.tags}
              isDarkMode={isDarkMode}
            />
          ))}

        {/* Display areas of improvement for custom drafts */}
        {data.areasOfImprovement && data.areasOfImprovement.length > 0 && (
          <div className="space-y-2">
            <h3
              className="text-sm font-semibold mb-3 font-serif"
              style={{ color: colors.text.primary }}
            >
              Areas of Improvement
            </h3>
            <ul className="space-y-2">
              {data.areasOfImprovement.map((area, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg border-l-4"
                  style={{
                    borderLeftColor: brandColors.teal,
                    backgroundColor: isDarkMode
                      ? 'rgba(20, 184, 166, 0.1)'
                      : 'rgba(20, 184, 166, 0.05)',
                  }}
                >
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: brandColors.teal,
                      color: brandColors.foregroundDark,
                    }}
                  >
                    {index + 1}
                  </span>
                  <p
                    className="text-sm leading-relaxed flex-1"
                    style={{ color: colors.text.primary }}
                  >
                    {area}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
