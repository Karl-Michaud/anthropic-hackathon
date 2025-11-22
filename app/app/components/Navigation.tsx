'use client'

import {
  Home,
  X,
  Plus,
  User,
  Upload,
  FileText,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import NextLink from 'next/link'
import { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react'
import { useWhiteboard } from '../context/WhiteboardContext'
import { useDarkMode } from '../context/DarkModeContext'
import {
  saveScholarshipToDB,
  generateAndSavePromptAnalysis,
  getScholarshipFromDB,
} from '../lib/dbUtils'
import { extractScholarshipInfo } from '../lib/claudeApi'
import { requestClaude } from '../lib/request'
import type { FeedbackData } from './DynamicFeedback/types'
import { IPromptWeights } from '../types/interfaces'

const navItems = [{ href: '/', icon: Home, label: 'Home' }]

// DarkModeToggle component
function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  return (
    <button
      onClick={toggleDarkMode}
      suppressHydrationWarning
      className={`group relative p-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${
        isDarkMode
          ? 'hover:bg-gray-600/40 text-yellow-300'
          : 'hover:bg-white/40 text-gray-500 group-hover:text-gray-600'
      }`}
      aria-label="Toggle dark mode"
    >
      {isMounted ? (
        isDarkMode ? (
          <Sun size={28} />
        ) : (
          <Moon size={28} />
        )
      ) : (
        <Moon size={28} />
      )}
      <span
        suppressHydrationWarning
        className={`absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs rounded-md px-2 py-1 transition-all duration-200 ${
          isDarkMode ? 'bg-gray-900 text-yellow-100' : 'bg-gray-900 text-white'
        }`}
      >
        {isMounted ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : 'Dark Mode'}
      </span>
    </button>
  )
}

// NavigationItem component
function NavigationItem({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <NextLink
      href={href}
      className="group relative p-2 rounded-xl transition-all duration-200 hover:bg-white/40 hover:scale-105 cursor-pointer"
      aria-label={label}
    >
      <Icon className="text-gray-500 group-hover:text-gray-600" size={28} />
      <span className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded-md px-2 py-1 transition-all duration-200">
        {label}
      </span>
    </NextLink>
  )
}

// ScholarshipUploadButton component
function ScholarshipUploadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer group relative p-2 rounded-xl transition-all duration-200 hover:bg-white/40 hover:scale-105"
    >
      <Plus className="text-gray-500 group-hover:text-gray-600" size={28} />
      <span className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded-md px-2 py-1 transition-all duration-200 whitespace-nowrap">
        Add Scholarship
      </span>
    </button>
  )
}

// AccountButton component
function AccountButton() {
  return (
    <button className="cursor-pointer group relative p-2 rounded-xl transition-all duration-200 hover:bg-white/40 hover:scale-105">
      <User className="text-gray-500 group-hover:text-gray-600" size={28} />
      <span className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded-md px-2 py-1 transition-all duration-200 whitespace-nowrap">
        Account
      </span>
    </button>
  )
}

// FileUploadArea component
function FileUploadArea({
  onFileUpload,
  isUploading,
}: {
  onFileUpload: (file: File) => void
  isUploading: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndUpload(file)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndUpload(file)
    }
  }

  const validateAndUpload = (file: File) => {
    const validTypes = ['text/plain', 'application/json', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a TXT, JSON, or PDF file')
      return
    }
    onFileUpload(file)
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl transition-all cursor-pointer p-8 text-gray-900 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Upload size={48} className="animate-pulse text-blue-500" />
          ) : (
            <FileText size={48} className="text-blue-400" />
          )}
          <div>
            <p className="text-base font-medium text-gray-900 mb-2">
              {isUploading
                ? 'Uploading...'
                : 'Drop your file here or click to browse'}
            </p>
            <p className="text-sm text-gray-500">
              Supports TXT, JSON, and PDF files
            </p>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.json,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

// ManualEntryForm component
function ManualEntryForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (title: string, description: string, prompts: string[]) => void
  isSubmitting: boolean
}) {
  const [scholarshipTitle, setScholarshipTitle] = useState('')
  const [scholarshipDescription, setScholarshipDescription] = useState('')
  const [scholarshipPrompt, setScholarshipPrompt] = useState('')

  const handleSubmit = () => {
    if (
      !scholarshipTitle.trim() ||
      !scholarshipDescription.trim() ||
      !scholarshipPrompt.trim()
    ) {
      alert('Please fill in title, description, and prompt')
      return
    }
    onSubmit(scholarshipTitle, scholarshipDescription, [scholarshipPrompt])
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scholarship Title
        </label>
        <input
          type="text"
          value={scholarshipTitle}
          onChange={(e) => setScholarshipTitle(e.target.value)}
          placeholder="Enter scholarship title"
          className="w-full py-2 px-3 border border-gray-200 rounded-md text-gray-900 transition-all text-sm bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scholarship Description
        </label>
        <textarea
          value={scholarshipDescription}
          onChange={(e) => setScholarshipDescription(e.target.value)}
          placeholder="Enter scholarship description"
          rows={4}
          className="w-full py-2 px-3 border border-gray-200 rounded-md text-gray-900 transition-all text-sm bg-white resize-none focus:border-blue-500 focus:ring-3 focus:ring-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Essay Prompt
        </label>
        <textarea
          value={scholarshipPrompt}
          onChange={(e) => setScholarshipPrompt(e.target.value)}
          placeholder="Enter essay prompt"
          rows={3}
          className="w-full py-2 px-3 border border-gray-200 rounded-md text-gray-900 transition-all text-sm bg-white resize-none focus:border-blue-500 focus:ring-3 focus:ring-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-md font-medium border-0 cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Scholarship'}
      </button>
    </div>
  )
}

// UploadModeToggle component
function UploadModeToggle({
  mode,
  onModeChange,
}: {
  mode: 'file' | 'text'
  onModeChange: (mode: 'file' | 'text') => void
}) {
  return (
    <div className="flex gap-1 rounded-md overflow-hidden shadow-sm bg-gray-100 p-1">
      <button
        onClick={() => onModeChange('file')}
        className={`px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
          mode === 'file'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        File
      </button>
      <button
        onClick={() => onModeChange('text')}
        className={`px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
          mode === 'text'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Text
      </button>
    </div>
  )
}

// ScholarshipUploadPopup component
export interface ScholarshipUploadResult {
  id: string
  title: string
  description: string
  prompts: string[]
  weights?: Record<string, unknown>
  personality?: Record<string, unknown>
  priorities?: Record<string, unknown>
  values?: Record<string, unknown>
}

function ScholarshipUploadPopup({
  isOpen,
  onClose,
  onScholarshipCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onScholarshipCreated: (data: ScholarshipUploadResult) => void
}) {
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

        const title = getValue(result.ScholarshipName, 'Untitled Scholarship')
        const description = getValue(result.ScholarshipDescription, '')
        const prompt = getValue(result.EssayPrompt, '')

        // Save scholarship to database
        const scholarship = await saveScholarshipToDB(title, description, [
          prompt,
        ])

        // Generate analysis data for all prompts
        await generateAndSavePromptAnalysis(
          scholarship.id,
          title,
          description,
          [prompt],
        )

        // Fetch the analysis data from the database
        const dbScholarship = await getScholarshipFromDB(scholarship.id)

        const weights = await requestClaude<IPromptWeights>(
          'promptWeights',
          title,
          description,
          prompt,
        )

        onScholarshipCreated({
          id: scholarship.id,
          title,
          description,
          prompts: [prompt],
          weights: weights as Record<string, unknown>,
          personality: dbScholarship?.promptPersonality || undefined,
          priorities: dbScholarship?.promptPriorities || undefined,
          values: dbScholarship?.promptValues || undefined,
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
      const scholarship = await saveScholarshipToDB(title, description, prompts)

      // Generate analysis data for all prompts
      await generateAndSavePromptAnalysis(
        scholarship.id,
        title,
        description,
        prompts,
      )

      // Fetch the analysis data from the database
      const dbScholarship = await getScholarshipFromDB(scholarship.id)

      const prompt = prompts[0] || ''
      const weights = await requestClaude<IPromptWeights>(
        'promptWeights',
        title,
        description,
        prompt,
      )

      onScholarshipCreated({
        id: scholarship.id,
        title,
        description,
        prompts,
        weights: weights as Record<string, unknown>,
        personality: dbScholarship?.promptPersonality || undefined,
        priorities: dbScholarship?.promptPriorities || undefined,
        values: dbScholarship?.promptValues || undefined,
      })
      onClose()
    } catch (err) {
      console.error('Creation error:', err)
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
        <div className="w-96 bg-white rounded-xl shadow-xl border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Scholarship
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md bg-transparent border-0 cursor-pointer text-gray-500 transition-all hover:bg-gray-100"
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

// Main Navigation component
export default function Navigation() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    // Provider not available
    isDarkMode = false
  }
  const { addScholarship, addJsonOutput, addFeedbackPanel } = useWhiteboard()

  const handleScholarshipCreated = (data: ScholarshipUploadResult) => {
    // Use the database ID directly instead of generating a new local ID
    const scholarshipId = data.id
    // Update the local context with the scholarship data using the database ID
    addScholarship({
      id: scholarshipId,
      title: data.title,
      description: data.description,
      prompt: data.prompts?.[0] || '',
      weights: data.weights,
      personality: data.personality,
      priorities: data.priorities,
      values: data.values,
    })

    // Also add the JSON output block with ALL pipeline data
    addJsonOutput(scholarshipId, {
      ScholarshipName: data.title,
      ScholarshipDescription: data.description,
      EssayPrompt: data.prompts?.[0] || '',
      Personality: data.personality,
      Priorities: data.priorities,
      Values: data.values,
    })

    // Create feedback panel for dynamic prompting
    const feedbackData: FeedbackData = {
      id: `feedback-${scholarshipId}`,
      essayId: '', // Will be linked when essay is created
      scholarshipId,
      problemTitle: `Dynamic Prompting for ${data.title}`,
      sections: [
        {
          id: `section-1-${scholarshipId}`,
          title: 'Essay Analysis',
          description: 'Get feedback on your essay response',
          questions: [
            {
              id: `q-1-${scholarshipId}`,
              text: 'Paste your essay draft below:',
              answer: '',
              placeholder: 'Paste your essay here...',
            },
          ],
          isComplete: false,
        },
      ],
      createdAt: Date.now(),
    }
    addFeedbackPanel(feedbackData)
  }

  return (
    <>
      <div
        className={`fixed left-6 top-6 bottom-6 z-50 rounded-2xl backdrop-blur-md shadow-lg p-2 flex flex-col items-center transition-colors duration-200 ${
          isDarkMode
            ? 'bg-gray-700/80 border border-gray-600/80'
            : 'bg-white/80 border border-white/80'
        }`}
      >
        {/* Top navigation items */}
        <nav className="flex flex-col gap-4 items-center py-4">
          {navItems.map(({ href, icon, label }) => (
            <NavigationItem key={href} href={href} icon={icon} label={label} />
          ))}
        </nav>

        {/* Spacer to push bottom items down */}
        <div className="flex-1" />

        {/* Bottom buttons */}
        <div className="flex flex-col gap-4 items-center py-4">
          <DarkModeToggle />
          <ScholarshipUploadButton onClick={() => setIsPopupOpen(true)} />
          <AccountButton />
        </div>
      </div>

      {/* Popup rendered outside sidebar - will be centered on screen */}
      <ScholarshipUploadPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onScholarshipCreated={handleScholarshipCreated}
      />
    </>
  )
}
