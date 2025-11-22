'use client'

import { Check } from 'lucide-react'
import Question from './Question'
import { FeedbackSectionProps } from '../types'

export default function FeedbackSection({
  title,
  description,
  questions,
  isComplete,
  onAnswerChange,
  onComplete,
}: FeedbackSectionProps) {
  // Check if all questions have non-empty answers
  const allQuestionsAnswered = questions.every((q) => q.answer.trim().length > 0)

  return (
    <div
      className={`border rounded-lg p-5 mb-4 transition-all ${
        isComplete
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 bg-white'
      }`}
    >
      {/* Section Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        {isComplete && (
          <div className="flex items-center gap-2 text-green-600 ml-4">
            <Check size={20} />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>

      {/* Questions */}
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

      {/* Complete Button */}
      {!isComplete && (
        <button
          onClick={onComplete}
          disabled={!allQuestionsAnswered}
          className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Complete Section
        </button>
      )}
    </div>
  )
}
