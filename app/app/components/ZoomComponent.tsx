'use client'

import { transitions } from '../styles/design-system'
import { useDarkMode } from '../context/DarkModeContext'

interface ZoomComponentProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export default function ZoomComponent({
  zoom,
  onZoomIn,
  onZoomOut,
}: ZoomComponentProps) {
  const percentage = Math.round(zoom * 100)

  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  return (
    <div
      className={`flex items-center gap-1 backdrop-blur-lg active:scale-95 rounded-lg shadow-lg border p-2 ${
        isDarkMode ? 'border-gray-700' : 'border-neutral-200'
      }`}
      style={{
        background: isDarkMode ? `rgba(31, 41, 55, 0.95)` : `rgba(255, 255, 255, 0.95)`,
        transition: transitions.common.all,
      }}
    >
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        className={`flex items-center justify-center transition-all active:scale-95 hover:scale-105 hover:cursor-pointer w-8 h-8 rounded-md text-lg font-bold ${
          isDarkMode
            ? 'bg-gray-700 hover:bg-blue-900 text-gray-300 hover:text-blue-300'
            : 'bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700'
        }`}
        aria-label="Zoom out"
      >
        −
      </button>

      {/* Zoom Percentage */}
      <div
        className={`min-w-16 text-center text-sm font-semibold tracking-wide ${
          isDarkMode ? 'text-gray-300' : 'text-neutral-700'
        }`}
      >
        {percentage}%
      </div>

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        className={`flex items-center justify-center transition-all active:scale-95 hover:scale-105 hover:cursor-pointer w-8 h-8 rounded-md text-lg font-bold ${
          isDarkMode
            ? 'bg-gray-700 hover:bg-blue-900 text-gray-300 hover:text-blue-300'
            : 'bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700'
        }`}
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  )
}
