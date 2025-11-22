'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Copy,
  Check,
} from 'lucide-react'
import { useEditing } from '../context/EditingContext'
import { ScholarshipData, AdaptiveWeights } from '../context/WhiteboardContext'
import { requestClaude } from '../lib/request'
import { IPromptWeights } from '../types/interfaces'

export type { ScholarshipData }

// HiddenRequirementTag component
function HiddenRequirementTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-linear-to-r from-sky-500 to-teal-500 rounded-full shadow-lg hover:scale-105 transition-all">
      {text}
    </span>
  )
}

// Personality Display
function PersonalityDisplay({ data }: { data?: Record<string, any> }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data || !data.personality_profile) return null

  const profile = data.personality_profile

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
          {profile.core_identity && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Core Identity:</p>
              <p className="text-gray-600">{profile.core_identity}</p>
            </div>
          )}
          {profile.tone_style && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Tone & Style:</p>
              <p className="text-gray-600">{profile.tone_style}</p>
            </div>
          )}
          {profile.values_emphasized &&
            profile.values_emphasized.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">
                  Values Emphasized:
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.values_emphasized.map(
                    (value: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        {value}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          {profile.recommended_essay_focus && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Recommended Essay Focus:
              </p>
              <p className="text-gray-600">{profile.recommended_essay_focus}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Priorities Display
function PrioritiesDisplay({ data }: { data?: Record<string, any> }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data) return null

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
          {data.primary_focus && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Primary Focus:</p>
              <p className="text-gray-600">{data.primary_focus}</p>
            </div>
          )}
          {data.priority_weights && (
            <div>
              <p className="font-semibold text-gray-700 mb-2">
                Priority Weights:
              </p>
              <div className="space-y-1 ml-2">
                {Object.entries(data.priority_weights).map(
                  ([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-semibold text-gray-700">
                        {typeof value === 'number'
                          ? `${(value * 100).toFixed(1)}%`
                          : String(value)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
          {data.summary && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Summary:</p>
              <p className="text-gray-600">{data.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Values Display
function ValuesDisplay({ data }: { data?: Record<string, any> }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data) return null

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
          {data.values_emphasized && data.values_emphasized.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Values Emphasized:
              </p>
              <div className="flex flex-wrap gap-1">
                {data.values_emphasized.map((value: string, idx: number) => (
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
          {data.value_definitions &&
            Object.keys(data.value_definitions).length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  Value Definitions:
                </p>
                <div className="space-y-2 ml-2">
                  {Object.entries(data.value_definitions).map(
                    ([key, value]: [string, any]) => (
                      <div key={key}>
                        <p className="font-medium text-gray-700">{key}:</p>
                        <p className="text-gray-600 ml-2">{String(value)}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          {data.evidence_phrases && data.evidence_phrases.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Evidence Phrases:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {data.evidence_phrases.map((phrase: string, idx: number) => (
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
function WeightsDisplay({ data }: { data?: Record<string, any> }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Handle both 'weights' and 'adaptiveWeights' field names
  const weightsData = data || {}
  if (!weightsData || Object.keys(weightsData).length === 0) return null

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer"
      >
        <h4 className="text-sm font-semibold text-gray-700">Weights</h4>
        <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-3">
          {Object.entries(data).map(
            ([category, categoryData]: [string, any]) => (
              <div key={category}>
                <p className="font-semibold text-gray-700 mb-2 capitalize">
                  {category}
                </p>
                <div className="ml-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Main Weight:</span>
                    <span className="font-semibold text-gray-700">
                      {typeof categoryData.weight === 'number'
                        ? `${(categoryData.weight * 100).toFixed(1)}%`
                        : String(categoryData.weight)}
                    </span>
                  </div>
                  {categoryData.subweights &&
                    Object.keys(categoryData.subweights).length > 0 && (
                      <div className="mt-2 ml-2 space-y-1 border-l-2 border-gray-300 pl-2">
                        {Object.entries(categoryData.subweights).map(
                          ([subkey, subvalue]: [string, any]) => (
                            <div key={subkey} className="flex justify-between">
                              <span className="text-gray-600">{subkey}:</span>
                              <span className="font-semibold text-gray-700">
                                {typeof subvalue === 'number'
                                  ? `${(subvalue * 100).toFixed(1)}%`
                                  : String(subvalue)}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}

// AIAnalysisSection component (fallback for unknown data types)
function AIAnalysisSection({
  title,
  data,
}: {
  title: string
  data?: Record<string, any>
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data) return null

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer"
      >
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 max-h-40 overflow-y-auto font-mono">
          <pre className="whitespace-pre-wrap wrap-break-word">
            {JSON.stringify(data, null, 2)}
          </pre>
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
function ScholarshipActions({
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

// JsonOutputBlock component
function JsonOutputBlock({
  data,
  onDelete,
}: {
  data: {
    ScholarshipName: string
    ScholarshipDescription: string
    EssayPrompt: string
    HiddenRequirements?: string[]
    AdaptiveWeights?: AdaptiveWeights
    Personality?: Record<string, any>
    Priorities?: Record<string, any>
    Values?: Record<string, any>
  }
  onDelete: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="w-[450px] bg-gray-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button */}
      {isHovered && (
        <div className="absolute -top-2 -right-2 z-10">
          <button
            onClick={onDelete}
            className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md"
            title="Delete"
          >
            <Trash2 size={16} className="text-white" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between py-2 px-4 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-400">
          AI Pipeline Output
        </span>
        <button
          onClick={handleCopy}
          className="p-1 border-0 bg-transparent cursor-pointer rounded-sm transition-all hover:bg-gray-700"
          title="Copy JSON"
        >
          {copied ? (
            <Check size={14} className="text-sky-400" />
          ) : (
            <Copy size={14} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* JSON Content */}
      <pre className="p-4 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed m-0">
        {jsonString}
      </pre>
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

export default function ScholarshipBlock({
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
        weights: weights as any,
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

      {/* Hidden Requirements */}
      {data.hiddenRequirements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {data.hiddenRequirements.map((req, index) => (
            <HiddenRequirementTag key={index} text={req} />
          ))}
        </div>
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
          <WeightsDisplay data={data.weights || data.adaptiveWeights} />
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

// Export wrapper for backward compatibility
export function ScholarshipWithActions(props: ScholarshipBlockProps) {
  return <ScholarshipBlock {...props} />
}

export { ScholarshipActions, JsonOutputBlock }
