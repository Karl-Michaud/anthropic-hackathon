'use client'

import { X, Check } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { FeedbackData, Question } from './DynamicFeedback/types'

// Question component - auto-resizing textarea
function Question({
  question,
  value,
  onChange,
  placeholder = 'Type your answer here...',
}: {
  question: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
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
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {question}
      </label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 bg-white border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all min-h-20"
        rows={3}
      />
      <div className="mt-1 text-xs text-neutral-500">
        {value.length} characters
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
}: {
  title: string
  description?: string
  questions: Question[]
  isComplete: boolean
  onAnswerChange: (questionId: string, answer: string) => void
  onComplete: () => void
}) {
  const allQuestionsAnswered = questions.every(
    (q) => q.answer.trim().length > 0,
  )

  return (
    <div
      className={`border rounded-lg p-5 mb-4 transition-all ${
        isComplete
          ? 'border-primary-500 bg-primary-50'
          : 'border-neutral-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-neutral-600">{description}</p>
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
          />
        ))}
      </div>

      {!isComplete && (
        <button
          onClick={onComplete}
          disabled={!allQuestionsAnswered}
          className="mt-4 w-full bg-primary-600 text-neutral-0 px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          Complete Section
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
  onSubmitToAI: () => void
}) {
  const completedSections = data.sections.filter((s) => s.isComplete).length
  const totalSections = data.sections.length
  const allSectionsComplete = completedSections === totalSections

  return (
    <div className="w-[600px] bg-white rounded-xl shadow-lg border border-neutral-200 flex flex-col max-h-[800px]">
      <div className="p-6 border-b border-neutral-200 shrink-0 relative bg-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Close feedback panel"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-900 pr-10">
          {data.problemTitle}
        </h2>
      </div>

      <div className="p-6 overflow-y-auto flex-1 bg-white">
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
          />
        ))}
      </div>

      <div className="p-6 border-t border-neutral-200 shrink-0 bg-white">
        <button
          onClick={onSubmitToAI}
          disabled={!allSectionsComplete}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          {allSectionsComplete
            ? 'Send to AI ✓ All Done'
            : `Send to AI (${completedSections}/${totalSections} complete)`}
        </button>
      </div>
    </div>
  )
}
