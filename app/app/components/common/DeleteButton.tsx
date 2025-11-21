'use client'

import { X } from 'lucide-react'
import { MouseEvent } from 'react'

interface DeleteButtonProps {
  onClick: () => void
  size?: 'sm' | 'md'
  className?: string
}

export default function DeleteButton({
  onClick,
  size = 'sm',
  className = '',
}: DeleteButtonProps) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
  }

  const iconSize = size === 'sm' ? 12 : 14

  return (
    <button
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-200/80 hover:bg-red-500 text-gray-500 hover:text-white transition-colors ${className}`}
      title="Delete"
    >
      <X size={iconSize} />
    </button>
  )
}
