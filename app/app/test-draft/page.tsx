'use client'

import { useState } from 'react'

interface AnalysisData {
  personality: {
    spirit: string
    toneStyle: string
    valuesEmphasized: string[]
    recommendedEssayFocus: string
  } | null
  priorities: {
    primaryFocus: string
    priorityWeights: Record<string, number>
  } | null
  values: {
    valuesEmphasized: string[]
    valueDefinitions: Record<string, string>
    evidencePhrases: string[]
  } | null
  weights: {
    weights: Record<string, {
      weight: number
      subweights: Record<string, number>
    }>
  } | null
}

export default function TestDraftPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [essay, setEssay] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEssay('')
    setAnalysis(null)

    try {
      const response = await fetch('/api/test-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate draft')
      }

      const data = await response.json()
      setEssay(data.essay)
      setAnalysis(data.analysis)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Draft Generation</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Scholarship Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., STEM Innovation Scholarship"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Scholarship Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste the full scholarship description here..."
              required
            />
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Essay Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Describe a time when you demonstrated innovation..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? 'Generating Draft...' : 'Generate Draft Essay'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Analysis Used for Draft</h2>

            {/* Personality */}
            {analysis.personality && (
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Personality Profile</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Spirit/Core Identity:</span> {analysis.personality.spirit}</p>
                  <p><span className="text-gray-400">Tone & Style:</span> {analysis.personality.toneStyle}</p>
                  <p><span className="text-gray-400">Values Emphasized:</span> {analysis.personality.valuesEmphasized.join(', ')}</p>
                  <p><span className="text-gray-400">Recommended Focus:</span> {analysis.personality.recommendedEssayFocus}</p>
                </div>
              </div>
            )}

            {/* Priorities */}
            {analysis.priorities && (
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Priorities</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Primary Focus:</span> {analysis.priorities.primaryFocus}</p>
                  <div>
                    <span className="text-gray-400">Priority Weights:</span>
                    <ul className="mt-1 ml-4 list-disc">
                      {Object.entries(analysis.priorities.priorityWeights).map(([key, value]) => (
                        <li key={key}>{key}: {value}%</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Values */}
            {analysis.values && (
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Values</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Values Emphasized:</span> {analysis.values.valuesEmphasized.join(', ')}</p>
                  <div>
                    <span className="text-gray-400">Value Definitions:</span>
                    <ul className="mt-1 ml-4 list-disc">
                      {Object.entries(analysis.values.valueDefinitions).map(([key, value]) => (
                        <li key={key}><strong>{key}:</strong> {value}</li>
                      ))}
                    </ul>
                  </div>
                  <p><span className="text-gray-400">Evidence Phrases:</span> {analysis.values.evidencePhrases.join('; ')}</p>
                </div>
              </div>
            )}

            {/* Weights */}
            {analysis.weights && (
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Hidden Criteria Weights</h3>
                <div className="space-y-3 text-sm">
                  {Object.entries(analysis.weights.weights).map(([category, data]) => (
                    <div key={category} className="border-l-2 border-purple-600 pl-3">
                      <p className="font-medium">{category} <span className="text-purple-300">({(data.weight * 100).toFixed(0)}%)</span></p>
                      <ul className="mt-1 ml-4 text-xs text-gray-400">
                        {Object.entries(data.subweights).map(([sub, weight]) => (
                          <li key={sub}>{sub}: {(weight * 100).toFixed(0)}%</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {essay && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Generated Essay</h2>
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="whitespace-pre-wrap leading-relaxed">{essay}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
