'use client'

interface EssayDeleteConfirmProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function EssayDeleteConfirm({
  onConfirm,
  onCancel,
}: EssayDeleteConfirmProps) {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
      <div className="text-center p-6">
        <p className="text-gray-700 font-medium mb-4">Delete this draft?</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
