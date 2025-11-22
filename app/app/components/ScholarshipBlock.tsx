'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { MoreVertical, Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { useEditing } from '../context/EditingContext'
import { ScholarshipData } from '../context/WhiteboardContext'
import { requestClaude } from '../lib/request'
import { IPromptWeights } from '../types/interfaces'

export type { ScholarshipData }

// Personality Display
function PersonalityDisplay({ data }: { data?: Record<string, unknown> }) {
  const [isExpanded, setIsExpanded] = useState(false)

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
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer"
      >
        <h4 className="text-sm font-semibold text-gray-700">Personality</h4>
        <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-3">
          {spirit && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Core Identity:</p>
              <p className="text-gray-600">{spirit}</p>
            </div>
          )}
          {toneStyle && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Tone & Style:</p>
              <p className="text-gray-600">{toneStyle}</p>
            </div>
          )}
          {valuesEmphasized && valuesEmphasized.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Values Emphasized:
              </p>
              <div className="flex flex-wrap gap-1">
                {valuesEmphasized.map((value: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {recommendedEssayFocus && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Recommended Essay Focus:
              </p>
              <p className="text-gray-600">{recommendedEssayFocus}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Priorities Display
function PrioritiesDisplay({ data }: { data?: Record<string, unknown> }) {
  const [isExpanded, setIsExpanded] = useState(false)

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
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer"
      >
        <h4 className="text-sm font-semibold text-gray-700">Priorities</h4>
        <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-3">
          {primaryFocus && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Primary Focus:</p>
              <p className="text-gray-600">{primaryFocus}</p>
            </div>
          )}
          {successProfile && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Success Profile:
              </p>
              <p className="text-gray-600">{successProfile}</p>
            </div>
          )}
          {selectionSignals && selectionSignals.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Selection Signals:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
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
function ValuesDisplay({ data }: { data?: Record<string, unknown> }) {
  const [isExpanded, setIsExpanded] = useState(false)

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
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer"
      >
        <h4 className="text-sm font-semibold text-gray-700">Values</h4>
        <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-3">
          {valuesEmphasized && valuesEmphasized.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Values Emphasized:
              </p>
              <div className="flex flex-wrap gap-1">
                {valuesEmphasized.map((value: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {valueDefinitions && Object.keys(valueDefinitions).length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-2">
                Value Definitions:
              </p>
              <div className="space-y-2 ml-2">
                {Object.entries(valueDefinitions).map(
                  ([key, value]: [string, unknown]) => (
                    <div key={key}>
                      <p className="font-medium text-gray-700">{key}:</p>
                      <p className="text-gray-600 ml-2">{String(value)}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
          {evidencePhrases && evidencePhrases.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Evidence Phrases:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
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
function WeightsDisplay({ data }: { data?: Record<string, unknown> }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data) return null

  // Use the data directly as it's already the weights object
  const weightsData = data

  if (!weightsData || Object.keys(weightsData).length === 0) return null

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer"
      >
        <h4 className="text-sm font-semibold text-gray-700">
          Hidden Criteria and Weights
        </h4>
        <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-3">
          {Object.entries(weightsData).map(
            ([category, categoryData]: [string, unknown]) => {
              const catData = categoryData as
                | Record<string, unknown>
                | undefined
              return (
                <div key={category}>
                  <p className="font-semibold text-gray-700 mb-2 capitalize">
                    {category}
                  </p>
                  <div className="ml-2 space-y-1">
                    {catData && typeof catData.weight !== 'undefined' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Main Weight:</span>
                        <span className="font-semibold text-gray-700">
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
                      <div className="mt-2 ml-2 space-y-1 border-l-2 border-gray-300 pl-2">
                        {Object.entries(
                          catData.subweights as Record<string, unknown>,
                        ).map(([subkey, subvalue]: [string, unknown]) => (
                          <div key={subkey} className="flex justify-between">
                            <span className="text-gray-600">{subkey}:</span>
                            <span className="font-semibold text-gray-700">
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
}: {
  value: string
  onChange: (value: string) => void
  isEditing: boolean
  className?: string
  isTitle?: boolean
  placeholder?: string
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
          className={`w-full bg-blue-50 border-b-4 border-blue-500 outline-none pb-2 text-gray-900 transition-all ${className}`}
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
        className={`w-full bg-blue-50 border-2 border-blue-500 rounded-lg p-3 outline-none resize-none text-gray-900 leading-relaxed transition-all ${className}`}
      />
    )
  }

  return (
    <div
      className={`transition-colors ${value ? 'text-gray-800' : 'text-gray-400 italic'} ${className}`}
    >
      {value || placeholder}
    </div>
  )
}

// ScholarshipMenu component
function ScholarshipMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
        title="Options"
      >
        <MoreVertical size={18} className="text-gray-400" />
      </button>

      {showMenu && (
        <div className="absolute top-8 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[140px]">
          <button
            onClick={handleEdit}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
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
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
      <div className="text-center p-6">
        <p className="text-gray-700 font-medium mb-4">
          Delete this scholarship?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
}: {
  onSave: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
      <button
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
          isLoading
            ? 'bg-blue-500 text-white cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
        }`}
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
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium border-none cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
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

  return (
    <div
      className={`w-[550px] bg-white rounded-xl p-6 relative transition-all border ${
        isEditing ? 'shadow-lg border-blue-500' : 'shadow-md border-gray-200'
      }`}
    >
      {/* Menu - top right */}
      {!isEditing && (
        <div className="absolute top-3 right-3">
          <ScholarshipMenu onEdit={startEditing} onDelete={handleDelete} />
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ScholarshipDeleteConfirm
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Title */}
      <EditableField
        value={currentData.title}
        onChange={(value) => handleFieldChange('title', value)}
        isEditing={isEditing}
        className="pr-8"
        isTitle
        placeholder="Scholarship Title"
      />

      {/* Description */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Description
        </h3>
        <EditableField
          value={currentData.description}
          onChange={(value) => handleFieldChange('description', value)}
          isEditing={isEditing}
          className="text-sm leading-relaxed"
          placeholder="Enter scholarship description..."
        />
      </div>

      {/* Prompt */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Prompt</h3>
        <EditableField
          value={currentData.prompt}
          onChange={(value) => handleFieldChange('prompt', value)}
          isEditing={isEditing}
          className="text-sm leading-relaxed"
          placeholder="Enter essay prompt..."
        />
      </div>

      {/* AI Analysis Sections */}
      {!isEditing && (
        <>
          <PersonalityDisplay data={data.personality} />
          <PrioritiesDisplay data={data.priorities} />
          <ValuesDisplay data={data.values} />
          <WeightsDisplay data={data.weights} />
          {!data.personality &&
            !data.priorities &&
            !data.values &&
            !data.weights && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-500 italic">
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
