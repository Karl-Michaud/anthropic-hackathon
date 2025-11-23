'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, FileText, X } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'
import { IUserProfile } from '../types/user-profile'
import { parseFileContent, getFileType } from '../lib/fileParser'
import { processUserProfileWithAI } from '../lib/request'
import {
  colorsLight,
  colorsDark,
  borderRadius,
  shadows,
  brandColors,
} from '../styles/design-system'

interface UserProfileFormProps {
  onSubmit: (profile: IUserProfile) => void
  initialData?: IUserProfile | null
}

export function UserProfileForm({
  onSubmit,
  initialData,
}: UserProfileFormProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '')
  const [lastName, setLastName] = useState(initialData?.lastName || '')
  const [aboutYourself, setAboutYourself] = useState(
    initialData?.rawData?.aboutYourself || '',
  )
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState(initialData?.rawData?.cvText || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isDarkMode } = useDarkMode()

  const colors = isDarkMode ? colorsDark : colorsLight

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    try {
      const fileType = await getFileType(file.name)
      if (!fileType) {
        setError(
          'Unsupported file type. Please upload a PDF, TXT, or JSON file.',
        )
        return
      }

      // Read file content
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string
          const parsedText = await parseFileContent(content, fileType)
          setCvFile(file)
          setCvText(parsedText)
        } catch (parseError) {
          setError(`Failed to parse file: ${(parseError as Error).message}`)
        }
      }

      if (fileType === 'pdf') {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    } catch (err) {
      setError(`Error processing file: ${(err as Error).message}`)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    try {
      const fileType = await getFileType(file.name)
      if (!fileType) {
        setError(
          'Unsupported file type. Please upload a PDF, TXT, or JSON file.',
        )
        return
      }

      // Read file content
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string
          const parsedText = await parseFileContent(content, fileType)
          setCvFile(file)
          setCvText(parsedText)
        } catch (parseError) {
          setError(`Failed to parse file: ${(parseError as Error).message}`)
        }
      }

      if (fileType === 'pdf') {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    } catch (err) {
      setError(`Error processing file: ${(err as Error).message}`)
    }
  }

  const handleRemoveFile = () => {
    setCvFile(null)
    setCvText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!firstName.trim()) {
      setError('First name is required')
      return
    }
    if (!lastName.trim()) {
      setError('Last name is required')
      return
    }
    if (!cvText.trim()) {
      setError('Please upload your CV/Resume')
      return
    }

    setIsLoading(true)

    try {
      const profile = await processUserProfileWithAI(
        firstName.trim(),
        lastName.trim(),
        cvText,
        aboutYourself.trim(),
      )
      onSubmit(profile)
    } catch (err) {
      setError(`Failed to process profile: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Disclaimer */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{
          backgroundColor: isDarkMode
            ? 'rgba(0, 128, 128, 0.1)'
            : 'rgba(0, 128, 128, 0.05)',
          border: `1px solid ${brandColors.teal}`,
          color: colors.text.primary,
        }}
      >
        <p className="font-medium mb-1">Why we need this information</p>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Your profile information will be used to tailor AI-generated essay
          drafts to your unique background, experiences, and achievements. This
          helps create more personalized and compelling scholarship essays.
        </p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            First Name <span style={{ color: brandColors.crail }}>*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            required
            className="w-full py-3 px-4 focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: colors.background.paper,
              border: `1px solid ${colors.border.default}`,
              borderRadius: borderRadius.md,
              color: colors.text.primary,
            }}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Last Name <span style={{ color: brandColors.crail }}>*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            required
            className="w-full py-3 px-4 focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: colors.background.paper,
              border: `1px solid ${colors.border.default}`,
              borderRadius: borderRadius.md,
              color: colors.text.primary,
            }}
          />
        </div>
      </div>

      {/* CV/Resume Upload */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          CV/Resume <span style={{ color: brandColors.crail }}>*</span>
        </label>

        {cvFile || cvText ? (
          <div
            className="p-4 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: colors.background.elevated,
              border: `1px solid ${brandColors.teal}`,
            }}
          >
            <div className="flex items-center gap-3">
              <FileText size={24} style={{ color: brandColors.teal }} />
              <div>
                <p
                  className="font-medium text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {cvFile?.name || 'Resume uploaded'}
                </p>
                <p className="text-xs" style={{ color: colors.text.secondary }}>
                  {cvText.length} characters extracted
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Remove file"
            >
              <X size={18} style={{ color: colors.text.secondary }} />
            </button>
          </div>
        ) : (
          <div
            className="relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-opacity-80 transition-all"
            style={{
              borderColor: isDragging
                ? brandColors.teal
                : colors.border.default,
              backgroundColor: isDragging
                ? `${brandColors.teal}1a`
                : colors.background.elevated,
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload
              size={32}
              className="mx-auto mb-3"
              style={{
                color: isDragging ? brandColors.teal : colors.text.secondary,
              }}
            />
            <p
              className="font-medium mb-1"
              style={{ color: colors.text.primary }}
            >
              {isDragging
                ? 'Drop your file here'
                : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              PDF, TXT, or JSON (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* About Yourself */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          Tell me about yourself{' '}
          <span style={{ color: colors.text.secondary }}>(optional)</span>
        </label>
        <textarea
          value={aboutYourself}
          onChange={(e) => setAboutYourself(e.target.value)}
          placeholder="Share your extracurricular involvement, passions, achievements, or anything else that makes you unique..."
          rows={4}
          className="w-full py-3 px-4 focus:outline-none focus:ring-2 transition-all resize-y"
          style={{
            backgroundColor: colors.background.paper,
            border: `1px solid ${colors.border.default}`,
            borderRadius: borderRadius.md,
            color: colors.text.primary,
            minHeight: '100px',
            maxHeight: '200px',
          }}
        />
        <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>
          This helps us understand your unique story beyond your resume
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="p-3 text-sm rounded-lg"
          style={{
            backgroundColor: isDarkMode
              ? 'rgba(128, 0, 0, 0.2)'
              : 'rgba(128, 0, 0, 0.1)',
            border: `1px solid ${colors.danger}`,
            color: colors.danger,
          }}
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          backgroundColor: brandColors.teal,
          color: colorsLight.text.inverse,
          borderRadius: borderRadius.md,
          boxShadow: shadows.sm,
        }}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing your profile...
          </>
        ) : initialData ? (
          'Update Profile'
        ) : (
          'Complete Profile Setup'
        )}
      </button>
    </form>
  )
}
