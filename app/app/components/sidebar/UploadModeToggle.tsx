'use client'

interface UploadModeToggleProps {
  mode: 'file' | 'text'
  onModeChange: (mode: 'file' | 'text') => void
}

export default function UploadModeToggle({
  mode,
  onModeChange,
}: UploadModeToggleProps) {
  return (
    <div className="flex gap-1 rounded-md overflow-hidden shadow-sm bg-neutral-100 p-1">
      <button
        onClick={() => onModeChange('file')}
        className={`px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
          mode === 'file'
            ? 'bg-primary-600 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        }`}
      >
        File
      </button>
      <button
        onClick={() => onModeChange('text')}
        className={`px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
          mode === 'text'
            ? 'bg-primary-600 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        }`}
      >
        Text
      </button>
    </div>
  )
}
