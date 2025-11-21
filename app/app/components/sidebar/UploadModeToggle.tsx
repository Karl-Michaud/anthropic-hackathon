'use client'

interface UploadModeToggleProps {
  mode: 'file' | 'text'
  onModeChange: (mode: 'file' | 'text') => void
}

export default function UploadModeToggle({ mode, onModeChange }: UploadModeToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden shadow-lg">
      <button
        onClick={() => onModeChange('file')}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          mode === 'file'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100/10 text-gray-900 hover:bg-gray-400/30'
        }`}
      >
        File
      </button>
      <button
        onClick={() => onModeChange('text')}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          mode === 'text'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100/10 text-gray-900 hover:bg-gray-400/30'
        }`}
      >
        Text
      </button>
    </div>
  )
}
