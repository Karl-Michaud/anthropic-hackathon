'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { MoreVertical, Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { useEditing } from '../context/EditingContext'
import { useDarkMode } from '../context/DarkModeContext'
import { ScholarshipData } from '../context/WhiteboardContext'
import { requestClaude } from '../lib/request'
import { IPromptWeights } from '../types/interfaces'
import { brandColors } from '../styles/design-system'

export type { ScholarshipData }

// Dark mode helper function
const getDarkModeClasses = (isDarkMode: boolean) => ({
  heading: isDarkMode ? 'text-gray-200' : 'text-gray-700',
  subheading: isDarkMode ? 'text-gray-300' : 'text-gray-600',
  label: isDarkMode ? 'text-gray-400' : 'text-gray-400',
  surface: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
  border: isDarkMode ? 'border-gray-600' : 'border-gray-200',
  text: isDarkMode ? 'text-gray-300' : 'text-gray-600',
  button: isDarkMode
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white',
  input: isDarkMode
    ? 'bg-gray-700 text-white border-gray-600'
    : 'bg-blue-50 text-gray-900 border-blue-500',
  menu: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  menuText: isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700',
})

// Personality Display
function PersonalityDisplay({
  data,
  isDarkMode = false,
}: {
  data?: Record<string, unknown>
  isDarkMode?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const classes = getDarkModeClasses(isDarkMode)

  if (!data) return null

  // Extract personality_profile if it exists, otherwise use data directly
  const profile = (
    typeof data.personality_profile === 'object' && data.personality_profile
      ? (data.personality_profile as Record<string, unknown>)
      : data
  ) as Record<string, unknown>

  const spirit = (profile.spirit || profile.core_identity) as string | undefined
  const toneStyle = (profile.toneStyle || profile.tone_style) as
    | string
    | undefined
  const valuesEmphasized = (profile.valuesEmphasized ||
    profile.values_emphasized) as string[] | undefined
  const recommendedEssayFocus = (profile.recommendedEssayFocus ||
    profile.recommended_essay_focus) as string | undefined

  if (!spirit && !toneStyle && !valuesEmphasized && !recommendedEssayFocus)
    return null

  return (
    <div className={`mt-4 border-t pt-4 ${classes.border}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left flex items-center justify-between px-2 py-1 rounded transition-colors cursor-pointer ${
          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
        }`}
      >
        <h4 className={`text-sm font-semibold ${classes.heading}`}>
          Personality
        </h4>
        <span className={`text-xs ${classes.label}`}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div
          className={`mt-2 p-3 rounded text-xs space-y-3 ${classes.surface} ${classes.text}`}
        >
          {spirit && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Core Identity:
              </p>
              <p className={`${classes.text} font-serif`}>{spirit}</p>
            </div>
          )}
          {toneStyle && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Tone & Style:
              </p>
              <p className={`${classes.text} font-serif`}>{toneStyle}</p>
            </div>
          )}
          {valuesEmphasized && valuesEmphasized.length > 0 && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Values Emphasized:
              </p>
              <div className="flex flex-wrap gap-1">
                {valuesEmphasized.map((value: string, idx: number) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded text-xs font-serif ${
                      isDarkMode
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {recommendedEssayFocus && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Recommended Essay Focus:
              </p>
              <p className={`${classes.text} font-serif`}>
                {recommendedEssayFocus}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Priorities Display
function PrioritiesDisplay({
  data,
  isDarkMode = false,
}: {
  data?: Record<string, unknown>
  isDarkMode?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const classes = getDarkModeClasses(isDarkMode)

  if (!data) return null

  const primaryFocus = (data.primaryFocus || data.primary_focus) as
    | string
    | undefined
  const selectionSignals = (data.selectionSignals || data.selection_signals) as
    | string[]
    | undefined
  const successProfile = (data.successProfile || data.success_profile) as
    | string
    | undefined

  if (!primaryFocus && !selectionSignals && !successProfile) return null

  return (
    <div className={`mt-4 border-t pt-4 ${classes.border}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left flex items-center justify-between px-2 py-1 rounded transition-colors cursor-pointer ${
          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
        }`}
      >
        <h4 className={`text-sm font-semibold ${classes.heading}`}>
          Priorities
        </h4>
        <span className={`text-xs ${classes.label}`}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div
          className={`mt-2 p-3 rounded text-xs space-y-3 ${classes.surface} ${classes.text}`}
        >
          {primaryFocus && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Primary Focus:
              </p>
              <p className={classes.text}>{primaryFocus}</p>
            </div>
          )}
          {successProfile && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Success Profile:
              </p>
              <p className={classes.text}>{successProfile}</p>
            </div>
          )}
          {selectionSignals && selectionSignals.length > 0 && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Selection Signals:
              </p>
              <ul className={`list-disc list-inside space-y-1 ${classes.text}`}>
                {selectionSignals.map((signal: string, idx: number) => (
                  <li key={idx}>{signal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Values Display
function ValuesDisplay({
  data,
  isDarkMode = false,
}: {
  data?: Record<string, unknown>
  isDarkMode?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const classes = getDarkModeClasses(isDarkMode)

  if (!data) return null

  const valuesEmphasized = (data.valuesEmphasized || data.values_emphasized) as
    | string[]
    | undefined
  const valueDefinitions = (data.valueDefinitions || data.value_definitions) as
    | Record<string, unknown>
    | undefined
  const evidencePhrases = (data.evidencePhrases || data.evidence_phrases) as
    | string[]
    | undefined

  if (!valuesEmphasized && !valueDefinitions && !evidencePhrases) return null

  return (
    <div className={`mt-4 border-t pt-4 ${classes.border}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left flex items-center justify-between px-2 py-1 rounded transition-colors cursor-pointer ${
          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
        }`}
      >
        <h4 className={`text-sm font-semibold ${classes.heading}`}>Values</h4>
        <span className={`text-xs ${classes.label}`}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div
          className={`mt-2 p-3 rounded text-xs space-y-3 ${classes.surface} ${classes.text}`}
        >
          {valuesEmphasized && valuesEmphasized.length > 0 && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Values Emphasized:
              </p>
              <div className="flex flex-wrap gap-1">
                {valuesEmphasized.map((value: string, idx: number) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded text-xs ${
                      isDarkMode
                        ? 'bg-purple-900 text-purple-200'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {valueDefinitions && Object.keys(valueDefinitions).length > 0 && (
            <div>
              <p className={`font-semibold mb-2 ${classes.heading}`}>
                Value Definitions:
              </p>
              <div className="space-y-2 ml-2">
                {Object.entries(valueDefinitions).map(
                  ([key, value]: [string, unknown]) => (
                    <div key={key}>
                      <p className={`font-medium ${classes.heading}`}>{key}:</p>
                      <p className={`ml-2 ${classes.text}`}>{String(value)}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
          {evidencePhrases && evidencePhrases.length > 0 && (
            <div>
              <p className={`font-semibold mb-1 ${classes.heading}`}>
                Evidence Phrases:
              </p>
              <ul className={`list-disc list-inside space-y-1 ${classes.text}`}>
                {evidencePhrases.map((phrase: string, idx: number) => (
                  <li key={idx}>{phrase}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Weights Display
function WeightsDisplay({
  data,
  isDarkMode = false,
}: {
  data?: Record<string, unknown>
  isDarkMode?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const classes = getDarkModeClasses(isDarkMode)

  if (!data) return null

  // Use the data directly as it's already the weights object
  const weightsData = data

  if (!weightsData || Object.keys(weightsData).length === 0) return null

  return (
    <div className={`mt-4 border-t pt-4 ${classes.border}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left flex items-center justify-between px-2 py-1 rounded transition-colors cursor-pointer ${
          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
        }`}
      >
        <h4 className={`text-sm font-semibold ${classes.heading}`}>
          Hidden Criteria and Weights
        </h4>
        <span className={`text-xs ${classes.label}`}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div
          className={`mt-2 p-3 rounded text-xs space-y-3 ${classes.surface} ${classes.text}`}
        >
          {Object.entries(weightsData).map(
            ([category, categoryData]: [string, unknown]) => {
              const catData = categoryData as
                | Record<string, unknown>
                | undefined
              return (
                <div key={category}>
                  <p
                    className={`font-semibold mb-2 capitalize ${classes.heading}`}
                  >
                    {category}
                  </p>
                  <div className="ml-2 space-y-1">
                    {catData && typeof catData.weight !== 'undefined' && (
                      <div className="flex justify-between">
                        <span className={classes.text}>Main Weight:</span>
                        <span className={`font-semibold ${classes.heading}`}>
                          {typeof catData.weight === 'number'
                            ? `${(catData.weight * 100).toFixed(1)}%`
                            : String(catData.weight)}
                        </span>
                      </div>
                    )}
                    {catData &&
                    catData.subweights &&
                    typeof catData.subweights === 'object' &&
                    Object.keys(catData.subweights as Record<string, unknown>)
                      .length > 0 ? (
                      <div
                        className={`mt-2 ml-2 space-y-1 border-l-2 pl-2 ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}
                      >
                        {Object.entries(
                          catData.subweights as Record<string, unknown>,
                        ).map(([subkey, subvalue]: [string, unknown]) => (
                          <div key={subkey} className="flex justify-between">
                            <span className={classes.text}>{subkey}:</span>
                            <span
                              className={`font-semibold ${classes.heading}`}
                            >
                              {typeof subvalue === 'number'
                                ? `${(subvalue * 100).toFixed(1)}%`
                                : String(subvalue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            },
          )}
        </div>
      )}
    </div>
  )
}

// EditableField component
function EditableField({
  value,
  onChange,
  isEditing,
  className = '',
  isTitle = false,
  placeholder = 'Click to edit...',
  isDarkMode = false,
}: {
  value: string
  onChange: (value: string) => void
  isEditing: boolean
  className?: string
  isTitle?: boolean
  placeholder?: string
  isDarkMode?: boolean
}) {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (
        inputRef.current instanceof HTMLTextAreaElement ||
        inputRef.current instanceof HTMLInputElement
      ) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  if (isEditing) {
    if (isTitle) {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border-b-4 outline-none pb-2 transition-all ${className}`}
          style={{
            backgroundColor: isDarkMode ? '#1F1E1D' : '#FDFBF9',
            color: isDarkMode ? '#FAF9F5' : '#3D2219',
            borderColor: '#C15F3C',
          }}
        />
      )
    }
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`w-full border-2 rounded-lg p-3 outline-none resize-none leading-relaxed transition-all ${className}`}
        style={{
          backgroundColor: isDarkMode ? '#1F1E1D' : '#FDFBF9',
          color: isDarkMode ? '#FAF9F5' : '#3D2219',
          borderColor: '#C15F3C',
        }}
      />
    )
  }

  return (
    <div
      className={`transition-colors ${
        value
          ? isDarkMode
            ? 'text-gray-200'
            : 'text-gray-800'
          : isDarkMode
            ? 'text-gray-500 italic'
            : 'text-gray-400 italic'
      } ${className}`}
    >
      {value || placeholder}
    </div>
  )
}

// ScholarshipMenu component
function ScholarshipMenu({
  onEdit,
  onDelete,
  isDarkMode = false,
}: {
  onEdit: () => void
  onDelete: () => void
  isDarkMode?: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const classes = getDarkModeClasses(isDarkMode)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleEdit = () => {
    setShowMenu(false)
    onEdit()
  }

  const handleDelete = () => {
    setShowMenu(false)
    onDelete()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`p-1.5 rounded transition-colors cursor-pointer ${
          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
        }`}
        title="Options"
      >
        <MoreVertical
          size={18}
          className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}
        />
      </button>

      {showMenu && (
        <div
          className={`absolute top-8 right-0 rounded-lg shadow-xl border py-1 z-50 min-w-[140px] ${classes.menu}`}
        >
          <button
            onClick={handleEdit}
            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 cursor-pointer ${
              isDarkMode
                ? 'text-red-400 hover:bg-red-900/30'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ScholarshipDeleteConfirm component
function ScholarshipDeleteConfirm({
  onConfirm,
  onCancel,
  isDarkMode = false,
}: {
  onConfirm: () => void
  onCancel: () => void
  isDarkMode?: boolean
}) {
  return (
    <div
      className={`absolute inset-0 backdrop-blur-sm rounded-xl flex items-center justify-center z-50 ${
        isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'
      }`}
    >
      <div className="text-center p-6">
        <p
          className={`font-medium mb-4 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Delete this scholarship?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ScholarshipEditButtons component
function ScholarshipEditButtons({
  onSave,
  onCancel,
  isLoading,
  isDarkMode = false,
}: {
  onSave: () => void
  onCancel: () => void
  isLoading: boolean
  isDarkMode?: boolean
}) {
  return (
    <div
      className={`flex justify-end gap-2 mt-4 pt-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <button
        onClick={onCancel}
        disabled={isLoading}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isDarkMode
            ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all text-white cursor-pointer ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundColor: brandColors.crail,
        }}
      >
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}

// ScholarshipActions component
export function ScholarshipActions({
  onDraft,
  isGenerating = false,
}: {
  onDraft: () => void
  isGenerating?: boolean
}) {
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={onDraft}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 text-white rounded-md font-medium border-none cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: brandColors.teal,
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Plus size={18} />
            Draft
          </>
        )}
      </button>
    </div>
  )
}

// Badge component for top highlights
function Badge({
  label,
  color,
  isDarkMode = false,
}: {
  label: string
  color: 'teal' | 'crail' | 'olive' | 'purple' | 'navy'
  isDarkMode?: boolean
}) {
  const colorMap = {
    teal: {
      light: { bg: brandColors.teal, text: '#ffffff' },
      dark: { bg: brandColors.teal, text: '#ffffff' },
    },
    crail: {
      light: { bg: brandColors.crail, text: '#ffffff' },
      dark: { bg: brandColors.crail, text: '#ffffff' },
    },
    olive: {
      light: { bg: brandColors.olive, text: '#ffffff' },
      dark: { bg: brandColors.olive, text: '#ffffff' },
    },
    purple: {
      light: { bg: brandColors.purple, text: '#ffffff' },
      dark: { bg: brandColors.purple, text: '#ffffff' },
    },
    navy: {
      light: { bg: brandColors.navy, text: '#ffffff' },
      dark: { bg: brandColors.navy, text: '#ffffff' },
    },
  }

  const styles = isDarkMode ? colorMap[color].dark : colorMap[color].light

  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      {label}
    </span>
  )
}

// Main ScholarshipBlock component
interface ScholarshipBlockProps {
  data: ScholarshipData
  onUpdate: (data: ScholarshipData) => void
  onDelete: (scholarshipId: string) => void
  onDraft?: (scholarshipId: string) => void
  isGeneratingEssay?: boolean
}

export function ScholarshipBlock({
  data,
  onUpdate,
  onDelete,
  onDraft,
  isGeneratingEssay = false,
}: ScholarshipBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editedData, setEditedData] = useState(data)
  const { setEditing: setGlobalEditing } = useEditing()

  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const startEditing = () => {
    setIsEditing(true)
    setGlobalEditing(true)
    setEditedData(data)
  }

  const handleFieldChange = (field: keyof ScholarshipData, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = useCallback(async () => {
    setIsLoading(true)

    try {
      const weights = await requestClaude<IPromptWeights>(
        'promptWeights',
        editedData.title,
        editedData.description,
        editedData.prompt,
      )

      onUpdate({
        ...editedData,
        weights: weights,
      })
    } catch (error) {
      console.error('Failed to update scholarship:', error)
      onUpdate(editedData)
    } finally {
      setIsLoading(false)
      setIsEditing(false)
      setGlobalEditing(false)
    }
  }, [editedData, onUpdate, setGlobalEditing])

  const handleCancel = () => {
    setEditedData(data)
    setIsEditing(false)
    setGlobalEditing(false)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onDelete(data.id)
    setShowDeleteConfirm(false)
  }

  const currentData = isEditing ? editedData : data

  // Extract badge information
  const getBadges = () => {
    const badges: Array<{
      label: string
      color: 'teal' | 'crail' | 'olive' | 'purple' | 'navy'
    }> = []

    // Get personality badge (teal)
    if (data.personality) {
      const profile = (
        typeof data.personality.personality_profile === 'object' &&
        data.personality.personality_profile
          ? (data.personality.personality_profile as Record<string, unknown>)
          : data.personality
      ) as Record<string, unknown>

      const spirit = (profile.spirit || profile.core_identity) as
        | string
        | undefined
      if (spirit) {
        // Extract a keyword from the spirit description
        const words = spirit.split(' ')
        const keyword = words.find((w) => w.length > 5) || words[0]
        badges.push({ label: keyword.replace(/[,.:;]/g, ''), color: 'teal' })
      }
    }

    // Get values badge (crail/red)
    if (data.values) {
      const valuesEmphasized = (data.values.valuesEmphasized ||
        data.values.values_emphasized) as string[] | undefined
      if (valuesEmphasized && valuesEmphasized.length > 0) {
        badges.push({ label: valuesEmphasized[0], color: 'crail' })
      }
    }

    // Get hidden requirement badge from weights (olive)
    if (data.weights && typeof data.weights === 'object') {
      const weightsData = data.weights as Record<string, unknown>
      const categories = Object.keys(weightsData)
      if (categories.length > 0) {
        // Find the category with highest weight
        let maxWeight = 0
        let maxCategory = categories[0]

        categories.forEach((category) => {
          const categoryData = weightsData[category] as
            | Record<string, unknown>
            | undefined
          if (categoryData && typeof categoryData.weight === 'number') {
            if (categoryData.weight > maxWeight) {
              maxWeight = categoryData.weight
              maxCategory = category
            }
          }
        })

        badges.push({
          label:
            maxCategory.charAt(0).toUpperCase() +
            maxCategory.slice(1).replace(/_/g, ' '),
          color: 'olive',
        })
      }
    }

    return badges
  }

  const badges = getBadges()

  return (
    <div
      className={`w-[550px] rounded-2xl p-6 relative transition-all border-2 ${
        isDarkMode
          ? isEditing
            ? 'bg-gray-800 shadow-lg'
            : 'bg-gray-800 shadow-md'
          : isEditing
            ? 'shadow-lg'
            : 'shadow-md'
      }`}
      style={{
        backgroundColor: isDarkMode
          ? brandColors.componentBackgroundDark
          : brandColors.componentBackground,
        borderColor: isEditing ? brandColors.crail : brandColors.cloudy,
      }}
    >
      {/* Menu - top right */}
      {!isEditing && (
        <div className="absolute top-3 right-3">
          <ScholarshipMenu
            onEdit={startEditing}
            onDelete={handleDelete}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ScholarshipDeleteConfirm
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Badges at top */}
      {!isEditing && badges.length > 0 && (
        <div className="flex gap-2 mb-4">
          {badges.map((badge, idx) => (
            <Badge
              key={idx}
              label={badge.label}
              color={badge.color}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <EditableField
        value={currentData.title}
        onChange={(value) => handleFieldChange('title', value)}
        isEditing={isEditing}
        className="pb-8 text-3xl font-serif"
        isTitle
        placeholder="Scholarship Title"
        isDarkMode={isDarkMode}
      />

      {/* Description */}
      <div className="mb-4">
        <h3
          className={`text-sm font-semibold mb-1 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Description
        </h3>
        <EditableField
          value={currentData.description}
          onChange={(value) => handleFieldChange('description', value)}
          isEditing={isEditing}
          className="text-sm leading-relaxed"
          placeholder="Enter scholarship description..."
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Prompt */}
      <div className="mb-4">
        <h3
          className={`text-sm font-semibold mb-1 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Prompt
        </h3>
        <EditableField
          value={currentData.prompt}
          onChange={(value) => handleFieldChange('prompt', value)}
          isEditing={isEditing}
          className="text-sm leading-relaxed"
          placeholder="Enter essay prompt..."
          isDarkMode={isDarkMode}
        />
      </div>

      {/* AI Analysis Sections */}
      {!isEditing && (
        <>
          <PersonalityDisplay data={data.personality} isDarkMode={isDarkMode} />
          <PrioritiesDisplay data={data.priorities} isDarkMode={isDarkMode} />
          <ValuesDisplay data={data.values} isDarkMode={isDarkMode} />
          <WeightsDisplay data={data.weights} isDarkMode={isDarkMode} />
          {!data.personality &&
            !data.priorities &&
            !data.values &&
            !data.weights && (
              <div
                className={`mt-4 p-3 rounded text-sm italic ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                No AI analysis available. Generate analysis to see personality,
                priorities, values, and weights.
              </div>
            )}
        </>
      )}

      {/* Save/Cancel buttons */}
      {isEditing && (
        <ScholarshipEditButtons
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Draft action button */}
      {!isEditing && onDraft && (
        <ScholarshipActions
          onDraft={() => onDraft(data.id)}
          isGenerating={isGeneratingEssay}
        />
      )}
    </div>
  )
}
