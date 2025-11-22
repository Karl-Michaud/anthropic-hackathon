'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FeedbackPanel } from '@/app/components/DynamicFeedback'
import type { FeedbackData } from '@/app/components/DynamicFeedback/types'

// Dummy data for testing
const dummyFeedbackData: FeedbackData = {
  id: 'feedback-test-1',
  essayId: 'essay-test-1',
  scholarshipId: 'scholarship-test-1',
  problemTitle: 'Hidden Weight Type: Resiliency (40%)',
  createdAt: Date.now(),
  sections: [
    {
      id: 'section-1',
      title: 'Describe: Missing Resiliency Experience',
      description: 'Your essay lacks concrete examples of overcoming challenges. Please provide specific instances.',
      questions: [
        {
          id: 'q1',
          text: 'What challenges have you overcome in your academic or personal life?',
          answer: '',
          placeholder: 'Example: I overcame financial hardship by working part-time while maintaining a 3.8 GPA...',
        },
        {
          id: 'q2',
          text: 'How did this experience change your perspective or approach to future challenges?',
          answer: '',
          placeholder: 'Example: This taught me the value of perseverance and time management...',
        },
        {
          id: 'q3',
          text: 'What specific skills or strengths did you develop through this challenge?',
          answer: '',
          placeholder: 'Example: I developed strong organizational skills and learned to prioritize effectively...',
        },
      ],
      isComplete: false,
    },
    {
      id: 'section-2',
      title: 'Strengthen: Leadership Impact',
      description: 'Your leadership examples need more depth and measurable outcomes.',
      questions: [
        {
          id: 'q4',
          text: 'Describe a specific leadership role where you made a measurable impact.',
          answer: '',
          placeholder: 'Example: As president of the coding club, I increased membership by 150%...',
        },
        {
          id: 'q5',
          text: 'What was the outcome of your leadership, and how did you measure success?',
          answer: '',
          placeholder: 'Example: We completed 3 community projects and received recognition from the mayor...',
        },
      ],
      isComplete: false,
    },
    {
      id: 'section-3',
      title: 'Clarify: Community Service Motivation',
      description: 'Explain why community service matters to you beyond just listing activities.',
      questions: [
        {
          id: 'q6',
          text: 'What drives your passion for community service?',
          answer: '',
          placeholder: 'Example: Growing up in an underserved community showed me the importance of giving back...',
        },
        {
          id: 'q7',
          text: 'How do you plan to continue serving your community in the future?',
          answer: '',
          placeholder: 'Example: I plan to establish a mentorship program for low-income students...',
        },
      ],
      isComplete: false,
    },
  ],
}

export default function TestFeedbackPage() {
  const [feedbackData, setFeedbackData] = useState<FeedbackData>(dummyFeedbackData)
  const [showPanel, setShowPanel] = useState(true)
  const [submittedData, setSubmittedData] = useState<FeedbackData | null>(null)

  const handleSectionAnswerChange = (sectionId: string, questionId: string, answer: string) => {
    setFeedbackData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((q) =>
                q.id === questionId ? { ...q, answer } : q
              ),
            }
          : section
      ),
    }))
  }

  const handleSectionComplete = (sectionId: string) => {
    setFeedbackData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, isComplete: true } : section
      ),
    }))
  }

  const handleSubmitToAI = () => {
    setSubmittedData(feedbackData)
    setShowPanel(false)
    console.log('Submitted to AI:', feedbackData)
  }

  const handleClose = () => {
    setShowPanel(false)
  }

  const handleReset = () => {
    setFeedbackData({
      ...dummyFeedbackData,
      sections: dummyFeedbackData.sections.map((section) => ({
        ...section,
        isComplete: false,
        questions: section.questions.map((q) => ({ ...q, answer: '' })),
      })),
    })
    setShowPanel(true)
    setSubmittedData(null)
  }

  return (
    <div className="min-h-screen p-8 bg-[#f5f3ed]">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 text-blue-600 hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Feedback Panel Component Test
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Test the dynamic feedback panel with dummy data
        </p>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showPanel ? 'Hide Panel' : 'Show Panel'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Reset Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side: Feedback Panel */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Component Preview:</h2>
            {showPanel ? (
              <div className="inline-block">
                <FeedbackPanel
                  data={feedbackData}
                  onClose={handleClose}
                  onSectionAnswerChange={handleSectionAnswerChange}
                  onSectionComplete={handleSectionComplete}
                  onSubmitToAI={handleSubmitToAI}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Panel is hidden. Click "Show Panel" to display.</p>
              </div>
            )}
          </div>

          {/* Right side: Current State */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Current State:</h2>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-3">Sections Status:</h3>
              <div className="space-y-3 mb-6">
                {feedbackData.sections.map((section, idx) => {
                  const answeredQuestions = section.questions.filter(
                    (q) => q.answer.trim().length > 0
                  ).length
                  const totalQuestions = section.questions.length

                  return (
                    <div key={section.id} className="border-l-4 border-gray-300 pl-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Section {idx + 1}</span>
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            section.isComplete
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {section.isComplete ? '✓ Complete' : 'Incomplete'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{section.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Questions answered: {answeredQuestions}/{totalQuestions}
                      </p>
                    </div>
                  )
                })}
              </div>

              <h3 className="font-semibold text-lg mb-3">Overall Progress:</h3>
              <div className="bg-gray-100 rounded p-3">
                <p className="text-sm">
                  <strong>Completed Sections:</strong>{' '}
                  {feedbackData.sections.filter((s) => s.isComplete).length} /{' '}
                  {feedbackData.sections.length}
                </p>
                <p className="text-sm mt-2">
                  <strong>Total Questions Answered:</strong>{' '}
                  {feedbackData.sections.reduce(
                    (acc, s) => acc + s.questions.filter((q) => q.answer.trim().length > 0).length,
                    0
                  )}{' '}
                  / {feedbackData.sections.reduce((acc, s) => acc + s.questions.length, 0)}
                </p>
              </div>

              {submittedData && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
                  <h3 className="font-semibold text-green-800 mb-2">
                    ✓ Submitted to AI!
                  </h3>
                  <p className="text-sm text-green-700">
                    Check console for submitted data
                  </p>
                </div>
              )}
            </div>

            {/* Raw Data View */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Raw Data (JSON):</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(feedbackData, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
