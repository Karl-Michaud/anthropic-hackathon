'use client'

import { X } from 'lucide-react'
import { MouseEvent } from 'react'
import {
  colors,
  borderRadius,
  shadows,
  transitions,
} from '../../styles/design-system'

interface DeleteButtonProps {
  onClick: () => void
  size?: 'sm' | 'md'
}

export default function DeleteButton({
  onClick,
  size = 'sm',
}: DeleteButtonProps) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  const sizeConfig = {
    sm: { width: '1.25rem', height: '1.25rem', iconSize: 12 },
    md: { width: '1.5rem', height: '1.5rem', iconSize: 16 },
  }

  const config = sizeConfig[size]

  return (
    <button
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      className="flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      style={{
        width: config.width,
        height: config.height,
        borderRadius: borderRadius.full,
        background: colors.neutral[100],
        color: colors.danger[500],
        boxShadow: shadows.xs,
        transition: transitions.common.all,
      }}
      onMouseEnter={(e) => {
        const button = e.currentTarget as HTMLButtonElement
        button.style.background = colors.danger[500]
        button.style.color = colors.neutral[0]
        button.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        const button = e.currentTarget as HTMLButtonElement
        button.style.background = colors.neutral[100]
        button.style.color = colors.danger[500]
        button.style.boxShadow = shadows.xs
      }}
      title="Delete"
    >
      <X size={config.iconSize} strokeWidth={2.5} />
    </button>
  )
}
