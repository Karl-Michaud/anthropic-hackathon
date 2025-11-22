'use client'

import { useRef, useEffect } from 'react'
import {
  colors,
  borderRadius,
  spacing,
  transitions,
  typography,
} from '../../styles/design-system'

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
      if (
        inputRef.current instanceof HTMLTextAreaElement ||
        inputRef.current instanceof HTMLInputElement
      ) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const baseStyles = {
    fontFamily: typography.fonts.sans,
    color: colors.neutral[900],
    transition: transitions.common.all,
  }

  if (isEditing) {
    if (isTitle) {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            ...baseStyles,
            width: '100%',
            background: colors.primary[50],
            borderBottom: `3px solid ${colors.primary[500]}`,
            outline: 'none',
            paddingBottom: spacing[2],
            fontSize: 'inherit',
          }}
          className={className}
        />
      )
    }
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...baseStyles,
          width: '100%',
          background: colors.primary[50],
          border: `2px solid ${colors.primary[500]}`,
          borderRadius: borderRadius.md,
          padding: spacing[3],
          outline: 'none',
          resize: 'none',
          fontSize: 'inherit',
          lineHeight: typography.lineHeights.relaxed,
        }}
        rows={4}
        className={className}
      />
    )
  }

  return (
    <div
      className={`transition-colors ${className}`}
      style={{
        ...baseStyles,
        color: value ? colors.neutral[800] : colors.neutral[400],
        fontStyle: value ? 'normal' : 'italic',
      }}
    >
      {value || placeholder}
    </div>
  )
}
