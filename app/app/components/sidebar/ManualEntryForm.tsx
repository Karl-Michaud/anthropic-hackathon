'use client'

import { useState } from 'react'

interface ManualEntryFormProps {
  onSubmit: (title: string, description: string, prompt: string) => void
  isSubmitting: boolean
}

export default function ManualEntryForm({ onSubmit, isSubmitting }: ManualEntryFormProps) {
  const [scholarshipTitle, setScholarshipTitle] = useState('')
  const [scholarshipDescription, setScholarshipDescription] = useState('')
  const [scholarshipPrompt, setScholarshipPrompt] = useState('')

  const handleSubmit = () => {
    if (!scholarshipTitle.trim() || !scholarshipDescription.trim()) {
      alert('Please fill in title and description')
      return
    }
    onSubmit(scholarshipTitle, scholarshipDescription, scholarshipPrompt)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scholarship Title
        </label>
        <input
          type="text"
          value={scholarshipTitle}
          onChange={(e) => setScholarshipTitle(e.target.value)}
          placeholder="Enter scholarship title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scholarship Description
        </label>
        <textarea
          value={scholarshipDescription}
          onChange={(e) => setScholarshipDescription(e.target.value)}
          placeholder="Enter scholarship description"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Essay Prompt
        </label>
        <textarea
          value={scholarshipPrompt}
          onChange={(e) => setScholarshipPrompt(e.target.value)}
          placeholder="Enter essay prompt (optional)"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
          disabled={isSubmitting}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Scholarship'}
      </button>
    </div>
  )
}
