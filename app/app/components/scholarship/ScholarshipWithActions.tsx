'use client'

import ScholarshipBlock from './ScholarshipBlock'
import { ScholarshipData } from '../../context/WhiteboardContext'

interface ScholarshipWithActionsProps {
  data: ScholarshipData
  onUpdate: (data: ScholarshipData) => void
  onDelete: (scholarshipId: string) => void
}

export default function ScholarshipWithActions({
  data,
  onUpdate,
  onDelete,
}: ScholarshipWithActionsProps) {
  return (
    <ScholarshipBlock data={data} onUpdate={onUpdate} onDelete={onDelete} />
  )
}
