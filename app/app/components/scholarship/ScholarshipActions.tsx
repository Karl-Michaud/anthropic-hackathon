'use client'

import { Plus } from 'lucide-react'

interface ScholarshipActionsProps {
  onDraft: () => void
}

export default function ScholarshipActions({
  onDraft,
}: ScholarshipActionsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={onDraft}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium border-none cursor-pointer transition-all hover:-translate-y-0.5"
      >
        <Plus size={18} />
        Draft
      </button>
      {/* Auto-generate button disabled for now - pending workflow implementation */}
    </div>
  )
}
