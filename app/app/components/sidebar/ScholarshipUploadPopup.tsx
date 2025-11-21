'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import FileUploadArea from './FileUploadArea'
import ManualEntryForm from './ManualEntryForm'
import UploadModeToggle from './UploadModeToggle'

export interface ScholarshipUploadResult {
  title: string
  description: string
  prompt: string
  hiddenRequirements: string[]
}

interface ScholarshipUploadPopupProps {
  isOpen: boolean
  onClose: () => void
  onScholarshipCreated: (data: ScholarshipUploadResult) => void
}

export default function ScholarshipUploadPopup({
  isOpen,
  onClose,
  onScholarshipCreated,
}: ScholarshipUploadPopupProps) {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const content = await readFileContent(file)
      const fileType = getFileType(file.type)

      const response = await fetch('/api/extract-scholarship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          fileType,
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const getValue = (extracted: string, fallback: string) =>
          extracted && extracted !== 'Missing' ? extracted : fallback

        onScholarshipCreated({
          title: getValue(result.data.ScholarshipName, 'Untitled Scholarship'),
          description: getValue(result.data.ScholarshipDescription, ''),
          prompt: getValue(result.data.EssayPrompt, ''),
          hiddenRequirements: result.data.HiddenRequirements || [],
        })
        onClose()
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('An error occurred while uploading the scholarship')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualSubmit = async (title: string, description: string, prompt: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const content = JSON.stringify({
        title,
        description,
        prompt,
      })

      const response = await fetch('/api/extract-scholarship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          fileType: 'json',
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const getName = (extracted: string, fallback: string) =>
          extracted && extracted !== 'Missing' ? extracted : fallback

        onScholarshipCreated({
          title: getName(result.data.ScholarshipName, title),
          description: getName(result.data.ScholarshipDescription, description),
          prompt: getName(result.data.EssayPrompt, prompt),
          hiddenRequirements: result.data.HiddenRequirements || [],
        })
        onClose()
      } else {
        onScholarshipCreated({
          title,
          description,
          prompt,
          hiddenRequirements: [],
        })
        onClose()
      }
    } catch (err) {
      console.error('Creation error:', err)
      onScholarshipCreated({
        title,
        description,
        prompt,
        hiddenRequirements: [],
      })
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          resolve(content)
        } else {
          reject(new Error('Failed to read file content'))
        }
      }
      reader.onerror = () => reject(new Error('File reading failed'))

      if (file.type === 'application/pdf') {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const getFileType = (mimeType: string): string => {
    if (mimeType === 'text/plain') return 'txt'
    if (mimeType === 'application/json') return 'json'
    if (mimeType === 'application/pdf') return 'pdf'
    return 'txt'
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Popup with floating toggle above */}
      <div className="relative flex flex-col items-start" onClick={(e) => e.stopPropagation()}>
        {/* Floating Mode Toggle - above popup */}
        <div className="mb-3">
          <UploadModeToggle mode={uploadMode} onModeChange={setUploadMode} />
        </div>

        {/* Main Popup */}
        <div className="w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upload Scholarship</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {uploadMode === 'file' ? (
              <FileUploadArea onFileUpload={handleFileUpload} isUploading={isProcessing} />
            ) : (
              <ManualEntryForm onSubmit={handleManualSubmit} isSubmitting={isProcessing} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
