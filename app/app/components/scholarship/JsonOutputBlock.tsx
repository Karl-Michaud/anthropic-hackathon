'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import DeleteButton from '../common/DeleteButton'

interface JsonOutputBlockProps {
  data: {
    ScholarshipName: string
    ScholarshipDescription: string
    EssayPrompt: string
    HiddenRequirements?: string[]
    AdaptiveWeights?: any // Complete adaptive weighting analysis
  }
  onDelete: () => void
}

export default function JsonOutputBlock({ data, onDelete }: JsonOutputBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="w-[450px] bg-gray-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button */}
      {isHovered && (
        <div className="absolute -top-2 -right-2 z-10">
          <DeleteButton onClick={onDelete} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-400">AI Pipeline Output</span>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Copy JSON"
        >
          {copied ? (
            <Check size={14} className="text-green-400" />
          ) : (
            <Copy size={14} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* JSON Content */}
      <pre className="p-4 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
        {jsonString}
      </pre>
    </div>
  )
}
