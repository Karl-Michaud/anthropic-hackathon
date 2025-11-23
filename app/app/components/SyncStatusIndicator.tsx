'use client'

import { useWhiteboard } from '../context/WhiteboardContext'
import { useDarkMode } from '../context/DarkModeContext'
import { brandColors, colorsLight, colorsDark } from '../styles/design-system'

export function SyncStatusIndicator() {
  const { syncStatus } = useWhiteboard()
  const { isDarkMode } = useDarkMode()
  const colors = isDarkMode ? colorsDark : colorsLight

  // Only show when syncing or error
  if (syncStatus !== 'syncing' && syncStatus !== 'error') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 group">
      {syncStatus === 'syncing' ? (
        <svg
          className={`animate-spin h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: brandColors.maroon }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span
            className="absolute bottom-6 right-0 opacity-0 group-hover:opacity-100 text-xs rounded-md px-2 py-1 transition-all duration-200 whitespace-nowrap"
            style={{
              backgroundColor: isDarkMode
                ? colors.background.elevated
                : brandColors.backgroundDark,
              color: brandColors.foregroundDark,
            }}
          >
            Sync failed
          </span>
        </>
      )}
    </div>
  )
}
