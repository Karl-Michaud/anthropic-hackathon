'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import FileUploadArea from './FileUploadArea'
import ManualEntryForm from './ManualEntryForm'
import UploadModeToggle from './UploadModeToggle'
import { saveScholarshipToDB } from '@/app/lib/dbUtils'
import { extractScholarshipInfo } from '@/app/lib/claudeApi'

export interface ScholarshipUploadResult {
  title: string
  description: string
  prompts: string[]
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

      const result = await extractScholarshipInfo(content)

      if (result && result.ScholarshipName) {
        const getValue = (extracted: string, fallback: string) =>
          extracted && extracted !== 'Missing' ? extracted : fallback

        const extractPrompts = (extracted: unknown): string[] => {
          if (!extracted || extracted === 'Missing') return []
          if (Array.isArray(extracted)) return extracted as string[]
          if (typeof extracted === 'string') return [extracted]
          return []
        }

        // Save to Supabase
        await saveScholarshipToDB(
          getValue(result.ScholarshipName, 'Untitled Scholarship'),
          getValue(result.ScholarshipDescription, ''),
          extractPrompts(result.EssayPrompt),
        )

        onScholarshipCreated({
          title: getValue(result.ScholarshipName, 'Untitled Scholarship'),
          description: getValue(result.ScholarshipDescription, ''),
          prompts: extractPrompts(result.EssayPrompt),
          hiddenRequirements: result.HiddenRequirements || [],
        })
        onClose()
      } else {
        setError('Failed to extract scholarship information')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(`An error occurred: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualSubmit = async (
    title: string,
    description: string,
    prompts: string[],
  ) => {
    setIsProcessing(true)
    setError(null)

    try {
      await saveScholarshipToDB(title, description, prompts)

      onScholarshipCreated({
        title: title,
        description: description,
        prompts: prompts,
        hiddenRequirements: [],
      })

      onClose()
    } catch (err) {
      setError(`Failed to save scholarship: ${(err as Error).message}`)
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

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Popup with floating toggle above */}
      <div
        className="relative flex flex-col items-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Mode Toggle - above popup */}
        <div className="mb-3">
          <UploadModeToggle mode={uploadMode} onModeChange={setUploadMode} />
        </div>

        {/* Main Popup */}
        <div className="w-96 bg-white rounded-xl shadow-xl border border-neutral-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">
              Upload Scholarship
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md bg-transparent border-0 cursor-pointer text-neutral-500 transition-all hover:bg-neutral-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {uploadMode === 'file' ? (
              <FileUploadArea
                onFileUpload={handleFileUpload}
                isUploading={isProcessing}
              />
            ) : (
              <ManualEntryForm
                onSubmit={handleManualSubmit}
                isSubmitting={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
