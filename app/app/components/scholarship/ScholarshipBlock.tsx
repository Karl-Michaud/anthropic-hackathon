'use client'

import { useState, useCallback } from 'react'
import HiddenRequirementTag from './HiddenRequirementTag'
import EditableField from './EditableField'
import ScholarshipEditButtons from './ScholarshipEditButtons'
import ScholarshipMenu from './ScholarshipMenu'
import ScholarshipDeleteConfirm from './ScholarshipDeleteConfirm'
import { useEditing } from '../../context/EditingContext'
import { ScholarshipData } from '../../context/WhiteboardContext'
import { extractScholarshipInfo } from '../../lib/claudeApi'

export type { ScholarshipData }

interface ScholarshipBlockProps {
  data: ScholarshipData
  onUpdate: (data: ScholarshipData) => void
  onDelete: (scholarshipId: string) => void
}

export default function ScholarshipBlock({
  data,
  onUpdate,
  onDelete,
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
      const content = JSON.stringify({
        title: editedData.title,
        description: editedData.description,
        prompt: editedData.prompt,
      })

      try {
        const result = await extractScholarshipInfo(content)
        if (
          result &&
          result.ScholarshipName &&
          result.ScholarshipName !== 'Missing'
        ) {
          onUpdate({
            ...editedData,
            title: result.ScholarshipName || editedData.title,
            description:
              result.ScholarshipDescription || editedData.description,
            prompt: result.EssayPrompt || editedData.prompt,
          })
        } else {
          onUpdate(editedData)
        }
      } catch {
        // API extraction failed, but still save the edited data
        // This can happen if API key is missing or invalid
        onUpdate(editedData)
      }
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
      className={`w-[550px] bg-white rounded-xl p-6 relative transition-all ${
        isEditing
          ? 'shadow-lg border-primary-500'
          : 'shadow-md border-neutral-200'
      } border`}
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
        <h3 className="text-sm font-semibold text-neutral-700 mb-1">
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
        <h3 className="text-sm font-semibold text-neutral-700 mb-1">Prompt</h3>
        <EditableField
          value={currentData.prompt}
          onChange={(value) => handleFieldChange('prompt', value)}
          isEditing={isEditing}
          className="text-sm leading-relaxed"
          placeholder="Enter essay prompt..."
        />
      </div>

      {/* Save/Cancel buttons */}
      {isEditing && (
        <ScholarshipEditButtons
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
