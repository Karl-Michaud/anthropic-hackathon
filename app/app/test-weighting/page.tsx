'use client'

import { useState } from 'react'
import { AdaptiveWeightingOutput } from '../types/adaptive-weighting'

export default function TestWeightingPage() {
  const [scholarshipName, setScholarshipName] = useState('')
  const [scholarshipDescription, setScholarshipDescription] = useState('')
  const [essayPrompt, setEssayPrompt] = useState('')
  const [result, setResult] = useState<AdaptiveWeightingOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/adaptive-weighting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ScholarshipName: scholarshipName,
          ScholarshipDescription: scholarshipDescription,
          EssayPrompt: essayPrompt,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Unknown error occurred')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setScholarshipName('Loran Scholars Foundation Award')
    setScholarshipDescription(`The Loran Award is a prestigious four-year undergraduate scholarship valued at $100,000.

We are looking for students who demonstrate:
- Character: integrity, courage, compassion, and a commitment to service
- Service: a meaningful commitment to serving others and making a difference in their communities
- Leadership potential: evidence of initiative, self-motivation, and the ability to inspire others

Eligibility:
- Canadian citizens or permanent residents
- Graduating high school in the current year
- Planning to attend a participating university

Application deadline: October 15, 2025

The selection process includes school nomination, regional interviews, and national finals. We value sustained commitment over resume padding, and look for authentic alignment with our values. Candidates should demonstrate how they've overcome challenges while maintaining their commitment to service.`)
    setEssayPrompt(
      'Describe a time when you faced significant adversity and how you responded while maintaining your commitment to serving others. What did this experience teach you about leadership and your own values?',
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Adaptive Weighting Test
        </h1>
        <p className="text-gray-600 mb-6">
          Test the adaptive weighting algorithm by entering scholarship
          information below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label
              htmlFor="scholarshipName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Scholarship Name
            </label>
            <input
              id="scholarshipName"
              type="text"
              value={scholarshipName}
              onChange={(e) => setScholarshipName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Loran Scholars Foundation Award"
              required
            />
          </div>

          <div>
            <label
              htmlFor="scholarshipDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Scholarship Description
            </label>
            <textarea
              id="scholarshipDescription"
              value={scholarshipDescription}
              onChange={(e) => setScholarshipDescription(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the full scholarship description including eligibility, values, deadline, etc."
              required
            />
          </div>

          <div>
            <label
              htmlFor="essayPrompt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Essay Prompt
            </label>
            <textarea
              id="essayPrompt"
              value={essayPrompt}
              onChange={(e) => setEssayPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the essay prompt you need to answer"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Weights'}
            </button>
            <button
              type="button"
              onClick={loadExample}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Load Example
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Adaptive Weights
              </h2>
            </div>

            <div className="p-4">
              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Primary Category Weights
                </h3>
                <div className="space-y-2">
                  {Object.entries(result)
                    .sort(([, a], [, b]) => b.weight - a.weight)
                    .map(([category, data]) => (
                      <div key={category} className="flex items-center gap-2">
                        <div className="w-48 text-sm text-gray-700 truncate">
                          {category}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: `${data.weight * 100}%` }}
                          />
                        </div>
                        <div className="w-16 text-sm text-gray-600 text-right">
                          {(data.weight * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Detailed breakdown */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Detailed Breakdown
                </h3>
                <div className="space-y-4">
                  {Object.entries(result)
                    .sort(([, a], [, b]) => b.weight - a.weight)
                    .map(([category, data]) => (
                      <div
                        key={category}
                        className="border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">
                            {category}
                          </h4>
                          <span className="text-sm font-semibold text-blue-600">
                            {(data.weight * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(data.subweights).map(
                            ([sub, weight]) => (
                              <div
                                key={sub}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600">{sub}</span>
                                <span className="text-gray-900">
                                  {((weight as number) * 100).toFixed(1)}%
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Raw JSON */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Raw JSON Output
                </h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
