'use client'

import { useEffect, useRef } from 'react'
import { QuestionProps } from '../types'

export default function Question({
  question,
  value,
  onChange,
  placeholder = 'Type your answer here...',
}: QuestionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {question}
      </label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[80px]"
        rows={3}
      />
      <div className="mt-1 text-xs text-gray-500">
        {value.length} characters
      </div>
    </div>
  )
}
