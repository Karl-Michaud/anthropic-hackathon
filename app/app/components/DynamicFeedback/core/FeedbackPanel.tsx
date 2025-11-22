'use client'

import { X } from 'lucide-react'
import FeedbackSection from './FeedbackSection'
import { FeedbackPanelProps } from '../types'

export default function FeedbackPanel({
  data,
  onClose,
  onSectionAnswerChange,
  onSectionComplete,
  onSubmitToAI,
}: FeedbackPanelProps) {
  // Calculate completion progress
  const completedSections = data.sections.filter((s) => s.isComplete).length
  const totalSections = data.sections.length
  const allSectionsComplete = completedSections === totalSections

  return (
    <div className="w-[600px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col max-h-[800px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close feedback panel"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 pr-10">
          {data.problemTitle}
        </h2>
      </div>

      {/* Content Area - Scrollable */}
      <div className="p-6 overflow-y-auto flex-1">
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

      {/* Footer with Submit Button */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={onSubmitToAI}
          disabled={!allSectionsComplete}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {allSectionsComplete ? (
            'Send to AI ✓ All Done'
          ) : (
            `Send to AI (${completedSections}/${totalSections} complete)`
          )}
        </button>
      </div>
    </div>
  )
}
