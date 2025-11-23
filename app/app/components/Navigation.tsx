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
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import NextLink from 'next/link'
import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useWhiteboard } from '../context/WhiteboardContext'
import { useDarkMode } from '../context/DarkModeContext'
import { useAuth } from './auth/AuthProvider'
import {
  saveScholarshipToDB,
  generateAndSavePromptAnalysis,
  getScholarshipFromDB,
} from '../lib/dbUtils'
import { extractScholarshipInfo } from '../lib/claudeApi'
import { requestClaude } from '../lib/request'
import { parseFileContent, getFileType } from '../lib/fileParser'
import type { FeedbackData } from '../lib/dynamicFeedback/types'
import { IPromptWeights } from '../types/interfaces'
import { brandColors, colorsLight, colorsDark } from '../styles/design-system'

const navItems = [{ href: '/', icon: Home, label: 'Home' }]

// DarkModeToggle component
function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode, isMounted } = useDarkMode()
  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <button
      onClick={toggleDarkMode}
      className="group relative p-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer"
      style={{
        color: isDarkMode ? brandColors.mustard : colors.text.secondary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDarkMode
          ? `${brandColors.backgroundDark}66`
          : `${brandColors.pampas}66`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
      aria-label="Toggle dark mode"
      suppressHydrationWarning
    >
      {!isMounted ? (
        <Moon size={28} />
      ) : isDarkMode ? (
        <Sun size={28} />
      ) : (
        <Moon size={28} />
      )}
      <span
        className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs rounded-md px-2 py-1 transition-all duration-200"
        style={{
          backgroundColor: isDarkMode
            ? colorsDark.background.elevated
            : brandColors.backgroundDark,
          color: isDarkMode ? brandColors.mustard : brandColors.foregroundDark,
        }}
        suppressHydrationWarning
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  )
}

// NavigationItem component
function NavigationItem({
  href,
  icon: Icon,
  label,
  isDarkMode = false,
}: {
  href: string
  icon: LucideIcon
  label: string
  isDarkMode?: boolean
}) {
  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <NextLink
      href={href}
      className="group relative p-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer"
      style={{
        color: colors.text.secondary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDarkMode
          ? `${brandColors.backgroundDark}66`
          : `${brandColors.pampas}66`
        e.currentTarget.style.color = colors.text.primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = colors.text.secondary
      }}
      aria-label={label}
    >
      <Icon size={28} />
      <span
        className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs rounded-md px-2 py-1 transition-all duration-200 whitespace-nowrap"
        style={{
          backgroundColor: isDarkMode
            ? colorsDark.background.elevated
            : brandColors.backgroundDark,
          color: brandColors.foregroundDark,
        }}
      >
        {label}
      </span>
    </NextLink>
  )
}

// ScholarshipUploadButton component
function ScholarshipUploadButton({
  onClick,
  isDarkMode = false,
}: {
  onClick: () => void
  isDarkMode?: boolean
}) {
  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <button
      onClick={onClick}
      className="cursor-pointer group relative p-2 rounded-xl transition-all duration-200 hover:scale-105"
      style={{
        color: colors.text.secondary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDarkMode
          ? `${brandColors.backgroundDark}66`
          : `${brandColors.pampas}66`
        e.currentTarget.style.color = colors.text.primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = colors.text.secondary
      }}
    >
      <Plus size={28} />
      <span
        className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs rounded-md px-2 py-1 transition-all duration-200 whitespace-nowrap"
        style={{
          backgroundColor: isDarkMode
            ? colorsDark.background.elevated
            : brandColors.backgroundDark,
          color: brandColors.foregroundDark,
        }}
      >
        Add Scholarship
      </span>
    </button>
  )
}

// AccountButton component - links to profile page
function AccountButton({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <NextLink
      href="/profile"
      className="cursor-pointer group relative p-2 rounded-xl transition-all duration-200 hover:scale-105"
      style={{
        color: colors.text.secondary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDarkMode
          ? `${brandColors.backgroundDark}66`
          : `${brandColors.pampas}66`
        e.currentTarget.style.color = colors.text.primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = colors.text.secondary
      }}
    >
      <User size={28} />
      <span
        className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs rounded-md px-2 py-1 transition-all duration-200 whitespace-nowrap"
        style={{
          backgroundColor: isDarkMode
            ? colorsDark.background.elevated
            : brandColors.backgroundDark,
          color: brandColors.foregroundDark,
        }}
      >
        Profile
      </span>
    </NextLink>
  )
}

// LogoutButton component
function LogoutButton({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const { signOut } = useAuth()
  const router = useRouter()
  const colors = isDarkMode ? colorsDark : colorsLight

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer group relative p-2 rounded-xl transition-all duration-200 hover:scale-105"
      style={{
        color: colors.text.secondary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDarkMode
          ? `${brandColors.backgroundDark}66`
          : `${brandColors.pampas}66`
        e.currentTarget.style.color = colors.text.primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = colors.text.secondary
      }}
    >
      <LogOut size={28} />
      <span
        className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs rounded-md px-2 py-1 transition-all duration-200 whitespace-nowrap"
        style={{
          backgroundColor: isDarkMode
            ? colorsDark.background.elevated
            : brandColors.backgroundDark,
          color: brandColors.foregroundDark,
        }}
      >
        Logout
      </span>
    </button>
  )
}

// FileUploadArea component
function FileUploadArea({
  onFileUpload,
  isUploading,
  isDarkMode = false,
}: {
  onFileUpload: (file: File) => void
  isUploading: boolean
  isDarkMode?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const colors = isDarkMode ? colorsDark : colorsLight

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
        className="border-2 border-dashed rounded-xl transition-all cursor-pointer p-8"
        style={{
          borderColor: isDragging ? brandColors.teal : brandColors.cloudy,
          backgroundColor: isDragging
            ? `${brandColors.teal}1a`
            : colors.background.paper,
          color: colors.text.primary,
          opacity: isUploading ? 0.5 : 1,
          pointerEvents: isUploading ? 'none' : 'auto',
        }}
        onMouseEnter={(e) => {
          if (!isDragging && !isUploading) {
            e.currentTarget.style.borderColor = brandColors.teal
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = brandColors.cloudy
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Upload
              size={48}
              className="animate-pulse"
              style={{ color: brandColors.teal }}
            />
          ) : (
            <FileText size={48} style={{ color: brandColors.teal }} />
          )}
          <div>
            <p
              className="text-base font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              {isUploading
                ? 'Uploading...'
                : 'Drop your file here or click to browse'}
            </p>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
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
  isDarkMode = false,
}: {
  onSubmit: (title: string, description: string, prompt: string) => void
  isSubmitting: boolean
  isDarkMode?: boolean
}) {
  const [scholarshipTitle, setScholarshipTitle] = useState('')
  const [scholarshipDescription, setScholarshipDescription] = useState('')
  const [scholarshipPrompt, setScholarshipPrompt] = useState('')
  const colors = isDarkMode ? colorsDark : colorsLight

  const handleSubmit = () => {
    if (
      !scholarshipTitle.trim() ||
      !scholarshipDescription.trim() ||
      !scholarshipPrompt.trim()
    ) {
      alert('Please fill in title, description, and prompt')
      return
    }
    onSubmit(scholarshipTitle, scholarshipDescription, scholarshipPrompt)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          Scholarship Title
        </label>
        <input
          type="text"
          value={scholarshipTitle}
          onChange={(e) => setScholarshipTitle(e.target.value)}
          placeholder="Enter scholarship title"
          className="w-full py-2 px-3 border rounded-md transition-all text-sm"
          style={{
            borderColor: brandColors.cloudy,
            color: colors.text.primary,
            backgroundColor: colors.background.paper,
            opacity: isSubmitting ? 0.5 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = brandColors.teal
            e.target.style.boxShadow = `0 0 0 3px ${brandColors.teal}1a`
          }}
          onBlur={(e) => {
            e.target.style.borderColor = brandColors.cloudy
            e.target.style.boxShadow = 'none'
          }}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          Scholarship Description
        </label>
        <textarea
          value={scholarshipDescription}
          onChange={(e) => setScholarshipDescription(e.target.value)}
          placeholder="Enter scholarship description"
          rows={4}
          className="w-full py-2 px-3 border rounded-md transition-all text-sm resize-none"
          style={{
            borderColor: brandColors.cloudy,
            color: colors.text.primary,
            backgroundColor: colors.background.paper,
            opacity: isSubmitting ? 0.5 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = brandColors.teal
            e.target.style.boxShadow = `0 0 0 3px ${brandColors.teal}1a`
          }}
          onBlur={(e) => {
            e.target.style.borderColor = brandColors.cloudy
            e.target.style.boxShadow = 'none'
          }}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          Essay Prompt
        </label>
        <textarea
          value={scholarshipPrompt}
          onChange={(e) => setScholarshipPrompt(e.target.value)}
          placeholder="Enter essay prompt"
          rows={3}
          className="w-full py-2 px-3 border rounded-md transition-all text-sm resize-none"
          style={{
            borderColor: brandColors.cloudy,
            color: colors.text.primary,
            backgroundColor: colors.background.paper,
            opacity: isSubmitting ? 0.5 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = brandColors.teal
            e.target.style.boxShadow = `0 0 0 3px ${brandColors.teal}1a`
          }}
          onBlur={(e) => {
            e.target.style.borderColor = brandColors.cloudy
            e.target.style.boxShadow = 'none'
          }}
          disabled={isSubmitting}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full px-4 py-3 rounded-md font-medium border-0 cursor-pointer transition-all"
        style={{
          backgroundColor: brandColors.teal,
          color: brandColors.foregroundDark,
          opacity: isSubmitting ? 0.6 : 1,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = brandColors.navy
            e.currentTarget.style.transform = 'translateY(-2px)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = brandColors.teal
          e.currentTarget.style.transform = 'translateY(0)'
        }}
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
  isDarkMode = false,
}: {
  mode: 'file' | 'text'
  onModeChange: (mode: 'file' | 'text') => void
  isDarkMode?: boolean
}) {
  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <div
      className="flex gap-1 rounded-md overflow-hidden shadow-sm p-1"
      style={{ backgroundColor: colors.background.elevated }}
    >
      <button
        onClick={() => onModeChange('file')}
        className="px-4 py-2 text-sm font-medium transition-all cursor-pointer rounded-md"
        style={{
          backgroundColor: mode === 'file' ? brandColors.teal : 'transparent',
          color:
            mode === 'file' ? brandColors.foregroundDark : colors.text.primary,
        }}
        onMouseEnter={(e) => {
          if (mode !== 'file') {
            e.currentTarget.style.backgroundColor = isDarkMode
              ? brandColors.backgroundDark
              : brandColors.pampas
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'file') {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        File
      </button>
      <button
        onClick={() => onModeChange('text')}
        className="px-4 py-2 text-sm font-medium transition-all cursor-pointer rounded-md"
        style={{
          backgroundColor: mode === 'text' ? brandColors.teal : 'transparent',
          color:
            mode === 'text' ? brandColors.foregroundDark : colors.text.primary,
        }}
        onMouseEnter={(e) => {
          if (mode !== 'text') {
            e.currentTarget.style.backgroundColor = isDarkMode
              ? brandColors.backgroundDark
              : brandColors.pampas
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'text') {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
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
  prompt: string
  weights?: Record<string, unknown>
  personality?: Record<string, unknown>
  priorities?: Record<string, unknown>
  values?: Record<string, unknown>
}

function ScholarshipUploadPopup({
  isOpen,
  onClose,
  onScholarshipCreated,
  isDarkMode = false,
}: {
  isOpen: boolean
  onClose: () => void
  onScholarshipCreated: (data: ScholarshipUploadResult) => void
  isDarkMode?: boolean
}) {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const colors = isDarkMode ? colorsDark : colorsLight

  if (!isOpen) return null

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Validate file size (max 10MB)
      const maxFileSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxFileSize) {
        setError('File is too large. Maximum file size is 10MB.')
        setIsProcessing(false)
        return
      }

      const rawContent = await readFileContent(file)
      const fileType = await getFileType(file.name)

      if (!fileType) {
        setError(
          'Unable to determine file type. Please use TXT, JSON, or PDF files.',
        )
        setIsProcessing(false)
        return
      }

      const parsedContent = await parseFileContent(rawContent, fileType)
      const result = await extractScholarshipInfo(parsedContent)

      if (result && result.ScholarshipName) {
        const getValue = (extracted: string, fallback: string) =>
          extracted && extracted !== 'Missing' ? extracted : fallback

        const title = getValue(result.ScholarshipName, 'Untitled Scholarship')
        const description = getValue(result.ScholarshipDescription, '')
        const prompt = getValue(result.EssayPrompt, '')

        // Save scholarship to database
        const scholarship = await saveScholarshipToDB(
          title,
          description,
          prompt,
        )

        // Generate analysis data for all prompts
        await generateAndSavePromptAnalysis(
          scholarship.id,
          title,
          description,
          prompt,
        )

        // Fetch the analysis data from the database
        const dbScholarship = (await getScholarshipFromDB(
          scholarship.id,
        )) as any

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
          prompt: prompt,
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
    prompt: string,
  ) => {
    setIsProcessing(true)
    setError(null)

    try {
      const scholarship = await saveScholarshipToDB(title, description, prompt)

      // Generate analysis data for all prompts
      await generateAndSavePromptAnalysis(
        scholarship.id,
        title,
        description,
        prompt,
      )

      // Fetch the analysis data from the database
      const dbScholarship = (await getScholarshipFromDB(scholarship.id)) as any

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
        prompt,
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
          <UploadModeToggle
            mode={uploadMode}
            onModeChange={setUploadMode}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Main Popup */}
        <div
          className="w-96 rounded-xl shadow-xl border"
          style={{
            backgroundColor: colors.background.paper,
            borderColor: brandColors.cloudy,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: brandColors.cloudy }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              Upload Scholarship
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md bg-transparent border-0 cursor-pointer transition-all"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode
                  ? brandColors.backgroundDark
                  : brandColors.pampas
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mx-4 mt-4 p-3 border rounded-md"
              style={{
                backgroundColor: `${brandColors.maroon}1a`,
                borderColor: brandColors.maroon,
              }}
            >
              <p className="text-sm" style={{ color: brandColors.maroon }}>
                {error}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {uploadMode === 'file' ? (
              <FileUploadArea
                onFileUpload={handleFileUpload}
                isUploading={isProcessing}
                isDarkMode={isDarkMode}
              />
            ) : (
              <ManualEntryForm
                onSubmit={handleManualSubmit}
                isSubmitting={isProcessing}
                isDarkMode={isDarkMode}
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
      prompt: data.prompt,
      weights: data.weights,
      personality: data.personality,
      priorities: data.priorities,
      values: data.values,
    })

    // Also add the JSON output block with ALL pipeline data
    addJsonOutput(scholarshipId, {
      ScholarshipName: data.title,
      ScholarshipDescription: data.description,
      EssayPrompt: data.prompt,
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

  const colors = isDarkMode ? colorsDark : colorsLight

  return (
    <>
      <div
        suppressHydrationWarning
        className="fixed left-6 top-6 bottom-6 z-50 rounded-2xl backdrop-blur-md shadow-lg p-2 flex flex-col items-center transition-colors duration-200 border"
        style={{
          backgroundColor: `${colors.background.paper}cc`,
          borderColor: `${brandColors.cloudy}cc`,
        }}
      >
        {/* Top navigation items */}
        <nav className="flex flex-col gap-4 items-center py-4">
          {navItems.map(({ href, icon, label }) => (
            <NavigationItem
              key={href}
              href={href}
              icon={icon}
              label={label}
              isDarkMode={isDarkMode}
            />
          ))}
          <AccountButton isDarkMode={isDarkMode} />
          <LogoutButton isDarkMode={isDarkMode} />
        </nav>

        {/* Spacer to push bottom items down */}
        <div className="flex-1" />

        {/* Bottom buttons */}
        <div className="flex flex-col gap-4 items-center py-4">
          <ScholarshipUploadButton
            onClick={() => setIsPopupOpen(true)}
            isDarkMode={isDarkMode}
          />
          <DarkModeToggle />
        </div>
      </div>

      {/* Popup rendered outside sidebar - will be centered on screen */}
      <ScholarshipUploadPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onScholarshipCreated={handleScholarshipCreated}
        isDarkMode={isDarkMode}
      />
    </>
  )
}
