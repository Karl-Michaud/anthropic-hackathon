'use client'

import ScholarshipBlock from './ScholarshipBlock'
import ScholarshipActions from './ScholarshipActions'
import { ScholarshipData } from '../../context/WhiteboardContext'

interface ScholarshipWithActionsProps {
  data: ScholarshipData
  onUpdate: (data: ScholarshipData) => void
  onDelete: (scholarshipId: string) => void
  onCreateDraft: (scholarshipId: string) => void
}

export default function ScholarshipWithActions({
  data,
  onUpdate,
  onDelete,
  onCreateDraft,
}: ScholarshipWithActionsProps) {
  return (
    <div className="flex flex-col items-start">
      <ScholarshipBlock data={data} onUpdate={onUpdate} onDelete={onDelete} />
      <div className="mt-3">
        <ScholarshipActions onDraft={() => onCreateDraft(data.id)} />
      </div>
    </div>
  )
}
