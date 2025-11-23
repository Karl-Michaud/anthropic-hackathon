'use client'

import { useWhiteboard } from '../context/WhiteboardContext'
import { useDarkMode } from '../context/DarkModeContext'

export function SyncStatusIndicator() {
  const { syncStatus } = useWhiteboard()
  const { isDarkMode } = useDarkMode()

  // Don't show anything if idle
  if (syncStatus === 'idle') {
    return null
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all ${
        syncStatus === 'syncing'
          ? isDarkMode
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white'
          : syncStatus === 'synced'
            ? isDarkMode
              ? 'bg-green-600 text-white'
              : 'bg-green-500 text-white'
            : isDarkMode
              ? 'bg-red-600 text-white'
              : 'bg-red-500 text-white'
      }`}
    >
      {syncStatus === 'syncing' && (
        <>
          <svg
            className="animate-spin h-4 w-4"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm font-medium">Syncing...</span>
        </>
      )}

      {syncStatus === 'synced' && (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">Synced</span>
        </>
      )}

      {syncStatus === 'error' && (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium">Sync failed</span>
        </>
      )}
    </div>
  )
}
