'use client'

import { useState } from 'react'

interface ManualEntryFormProps {
  onSubmit: (title: string, description: string, prompts: string[]) => void
  isSubmitting: boolean
}

export default function ManualEntryForm({
  onSubmit,
  isSubmitting,
}: ManualEntryFormProps) {
  const [scholarshipTitle, setScholarshipTitle] = useState('')
  const [scholarshipDescription, setScholarshipDescription] = useState('')
  const [scholarshipPrompts, setScholarshipPrompts] = useState([''])

  const handleSubmit = () => {
    if (!scholarshipTitle.trim() || !scholarshipDescription.trim()) {
      alert('Please fill in title and description')
      return
    }
    onSubmit(scholarshipTitle, scholarshipDescription, scholarshipPrompts)
  }

  const handlePromptChange = (index: number, value: string) => {
    setScholarshipPrompts((prev) => {
      const newPrompts = [...prev]
      newPrompts[index] = value
      return newPrompts
    })
  }

  const addPrompt = () => {
    setScholarshipPrompts((prev) => [...prev, ''])
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Scholarship Title
        </label>
        <input
          type="text"
          value={scholarshipTitle}
          onChange={(e) => setScholarshipTitle(e.target.value)}
          placeholder="Enter scholarship title"
          className="w-full py-2 px-3 border border-neutral-200 rounded-md text-neutral-900 transition-all text-sm bg-white focus:border-primary-500 focus:ring-3 focus:ring-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Scholarship Description
        </label>
        <textarea
          value={scholarshipDescription}
          onChange={(e) => setScholarshipDescription(e.target.value)}
          placeholder="Enter scholarship description"
          rows={4}
          className="w-full py-2 px-3 border border-neutral-200 rounded-md text-neutral-900 transition-all text-sm bg-white resize-none focus:border-primary-500 focus:ring-3 focus:ring-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Essay Prompt
        </label>
        {scholarshipPrompts.map((prompt, index) => (
          <textarea
            key={index}
            value={prompt}
            onChange={(e) => handlePromptChange(index, e.target.value)}
            placeholder="Enter essay prompt (optional)"
            rows={3}
            className="w-full py-2 px-3 border border-neutral-200 rounded-md text-neutral-900 transition-all text-sm bg-white resize-none mb-2 focus:border-primary-500 focus:ring-3 focus:ring-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          />
        ))}
        <button
          type="button"
          onClick={addPrompt}
          disabled={isSubmitting}
          className="mt-1 text-sm text-primary-600 bg-transparent border-0 cursor-pointer underline transition-all hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add another prompt
        </button>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-primary-600 text-white rounded-md font-medium border-0 cursor-pointer transition-all hover:bg-primary-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Scholarship'}
      </button>
    </div>
  )
}
