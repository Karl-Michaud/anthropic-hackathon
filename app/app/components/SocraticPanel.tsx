'use client'

import { X, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useDarkMode } from '../context/DarkModeContext'

export interface SocraticQuestion {
  id: string
  text: string
  answer: string
}

export interface SocraticPanelData {
  id: string
  sectionId: string
  title: string
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
  isDarkMode = false,
}: {
  question: string
  value: string
  onChange: (value: string) => void
  isDarkMode?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="mb-4">
      <label
        className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-200' : 'text-neutral-700'
        }`}
      >
        {question}
      </label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your response here..."
        className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all min-h-20 ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500'
            : 'bg-white border-neutral-300 text-neutral-900 placeholder-gray-400'
        }`}
        rows={3}
      />
      <div
        className={`mt-1 text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-neutral-500'
        }`}
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

  return (
    <div
      ref={panelRef}
      className={`w-[500px] rounded-xl shadow-2xl border flex flex-col max-h-[700px] fixed right-8 top-1/2 transform -translate-y-1/2 z-40 ${
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-neutral-200'
      }`}
    >
      <div
        className={`p-6 border-b shrink-0 relative ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-neutral-200'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 transition-colors ${
            isDarkMode
              ? 'text-gray-500 hover:text-gray-400'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
          aria-label="Close socratic panel"
        >
          <X size={24} />
        </button>
        <h2
          className={`text-2xl font-bold pr-10 ${
            isDarkMode ? 'text-gray-100' : 'text-neutral-900'
          }`}
        >
          {data.title}
        </h2>
      </div>

      <div
        className={`p-6 overflow-y-auto flex-1 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {data.questions.map((question) => (
          <Question
            key={question.id}
            question={question.text}
            value={question.answer}
            onChange={(value) => onAnswerChange(question.id, value)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      <div
        className={`p-6 border-t shrink-0 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-neutral-200'
        }`}
      >
        <button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered || isSubmitting.current}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting.current ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Updating essay...
            </>
          ) : (
            'Submit & Update Essay'
          )}
        </button>
      </div>
    </div>
  )
}
