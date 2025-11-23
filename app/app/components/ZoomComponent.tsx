'use client'

import {
  transitions,
  brandColors,
  colorsLight,
  colorsDark,
} from '../styles/design-system'
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
  const { isDarkMode } = useDarkMode()

  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <div
      className="flex items-center gap-1 backdrop-blur-lg active:scale-95 rounded-lg shadow-lg border p-2"
      style={{
        backgroundColor: isDarkMode
          ? colors.background.elevated
          : colors.background.paper,
        borderColor: brandColors.cloudy,
        transition: transitions.common.all,
      }}
    >
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        className="flex items-center justify-center transition-all active:scale-95 hover:scale-105 hover:cursor-pointer w-8 h-8 rounded-md text-lg font-bold"
        style={{
          backgroundColor: isDarkMode ? brandColors.teal : brandColors.pampas,
          color: isDarkMode
            ? brandColors.foregroundDark
            : brandColors.foreground,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = brandColors.teal
          e.currentTarget.style.color = brandColors.foregroundDark
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? brandColors.teal
            : brandColors.pampas
          e.currentTarget.style.color = isDarkMode
            ? brandColors.foregroundDark
            : brandColors.foreground
        }}
        aria-label="Zoom out"
      >
        −
      </button>

      {/* Zoom Percentage */}
      <div
        className="min-w-16 text-center text-sm font-semibold tracking-wide"
        style={{
          color: colors.text.primary,
        }}
      >
        {percentage}%
      </div>

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        className="flex items-center justify-center transition-all active:scale-95 hover:scale-105 hover:cursor-pointer w-8 h-8 rounded-md text-lg font-bold"
        style={{
          backgroundColor: isDarkMode ? brandColors.teal : brandColors.pampas,
          color: isDarkMode
            ? brandColors.foregroundDark
            : brandColors.foreground,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = brandColors.teal
          e.currentTarget.style.color = brandColors.foregroundDark
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? brandColors.teal
            : brandColors.pampas
          e.currentTarget.style.color = isDarkMode
            ? brandColors.foregroundDark
            : brandColors.foreground
        }}
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  )
}
