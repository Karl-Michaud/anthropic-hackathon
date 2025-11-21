'use client'

import { Plus } from 'lucide-react'

interface ScholarshipUploadButtonProps {
  onClick: () => void
}

export default function ScholarshipUploadButton({ onClick }: ScholarshipUploadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="hover:cursor-pointer group relative p-2 rounded-xl transition-all duration-200 hover:bg-white/40 hover:scale-105"
    >
      <Plus
        className="text-gray-500 group-hover:text-gray-600"
        size={28}
      />
      <span className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded-md px-2 py-1 transition-all duration-200 whitespace-nowrap">
        Add Scholarship
      </span>
    </button>
  )
}
