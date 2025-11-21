'use client'

import { useRef, useEffect } from 'react'

interface EditableFieldProps {
  value: string
  onChange: (value: string) => void
  isEditing: boolean
  className?: string
  isTitle?: boolean
  placeholder?: string
}

export default function EditableField({
  value,
  onChange,
  isEditing,
  className = '',
  isTitle = false,
  placeholder = 'Click to edit...',
}: EditableFieldProps) {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  if (isEditing) {
    if (isTitle) {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/50 border-b-2 border-blue-500 outline-none text-gray-900 ${className}`}
        />
      )
    }
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/50 border border-blue-500 rounded-lg p-2 outline-none resize-none text-gray-900 ${className}`}
        rows={4}
      />
    )
  }

  return (
    <div className={`${className}`}>
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </div>
  )
}
