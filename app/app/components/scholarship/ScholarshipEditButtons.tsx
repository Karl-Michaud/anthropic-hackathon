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
    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
      <button
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
