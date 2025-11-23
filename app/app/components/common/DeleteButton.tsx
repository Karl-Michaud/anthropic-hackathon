'use client'

import { X } from 'lucide-react'
import { MouseEvent } from 'react'
import {
  brandColors,
  colorsLight,
  colorsDark,
  borderRadius,
  shadows,
  transitions,
} from '../../styles/design-system'
import { useDarkMode } from '../../context/DarkModeContext'

interface DeleteButtonProps {
  onClick: () => void
  size?: 'sm' | 'md'
}

export default function DeleteButton({
  onClick,
  size = 'sm',
}: DeleteButtonProps) {
  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  const sizeConfig = {
    sm: { width: '1.25rem', height: '1.25rem', iconSize: 12 },
    md: { width: '1.5rem', height: '1.5rem', iconSize: 16 },
  }

  const config = sizeConfig[size]
  const colors = isDarkMode ? colorsDark : colorsLight

  const bgColor = isDarkMode ? brandColors.backgroundDark : brandColors.pampas
  const textColor = brandColors.maroon
  const hoverBgColor = brandColors.maroon
  const hoverTextColor = brandColors.foregroundDark

  return (
    <button
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      className="flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      style={{
        width: config.width,
        height: config.height,
        borderRadius: borderRadius.full,
        background: bgColor,
        color: textColor,
        boxShadow: shadows.xs,
        transition: transitions.common.all,
      }}
      onMouseEnter={(e) => {
        const button = e.currentTarget as HTMLButtonElement
        button.style.background = hoverBgColor
        button.style.color = hoverTextColor
        button.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        const button = e.currentTarget as HTMLButtonElement
        button.style.background = bgColor
        button.style.color = textColor
        button.style.boxShadow = shadows.xs
      }}
      title="Delete"
    >
      <X size={config.iconSize} strokeWidth={2.5} />
    </button>
  )
}
