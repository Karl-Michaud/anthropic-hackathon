'use client'

import { Loader2 } from 'lucide-react'

interface ScholarshipEditButtonsProps {
  onSave: () => void
  onCancel: () => void
  isLoading: boolean
}

export default function ScholarshipEditButtons({
  onSave,
  onCancel,
  isLoading,
}: ScholarshipEditButtonsProps) {
  return (
    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-neutral-200">
      <button
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
          isLoading
            ? 'bg-primary-500 text-white cursor-not-allowed'
            : 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer'
        }`}
      >
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
