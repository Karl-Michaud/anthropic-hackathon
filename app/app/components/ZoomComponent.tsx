'use client'

import { transitions } from '../styles/design-system'

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

  return (
    <div
      className="flex items-center gap-1 backdrop-blur-lg active:scale-95 rounded-lg shadow-lg border border-neutral-200 p-2"
      style={{
        background: `rgba(255, 255, 255, 0.95)`,
        transition: transitions.common.all,
      }}
    >
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        className="flex items-center justify-center transition-all active:scale-95 hover:scale-105 hover:cursor-pointer w-8 h-8 rounded-md bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700 text-lg font-bold"
        aria-label="Zoom out"
      >
        −
      </button>

      {/* Zoom Percentage */}
      <div className="min-w-16 text-center text-sm font-semibold text-neutral-700 tracking-wide">
        {percentage}%
      </div>

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        className="flex items-center justify-center transition-all active:scale-95 hover:scale-105 hover:cursor-pointer w-8 h-8 rounded-md bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700 text-lg font-bold"
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  )
}
