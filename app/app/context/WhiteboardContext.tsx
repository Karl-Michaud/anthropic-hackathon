'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ScholarshipData } from '../components/scholarship/ScholarshipBlock'
import { EssayData } from '../components/essay/EssayBlock'

export interface JsonOutputData {
  id: string
  scholarshipId: string
  data: {
    ScholarshipName: string
    ScholarshipDescription: string
    EssayPrompt: string
    HiddenRequirements?: string[]
  }
}

interface WhiteboardContextType {
  scholarships: ScholarshipData[]
  essays: EssayData[]
  jsonOutputs: JsonOutputData[]
  addScholarship: (scholarship: Omit<ScholarshipData, 'id'>) => string
  updateScholarship: (scholarship: ScholarshipData) => void
  deleteScholarship: (scholarshipId: string) => void
  addEssay: (essay: Omit<EssayData, 'id'>) => string
  updateEssay: (essay: EssayData) => void
  deleteEssay: (essayId: string) => void
  addJsonOutput: (scholarshipId: string, data: JsonOutputData['data']) => string
}

const WhiteboardContext = createContext<WhiteboardContextType | null>(null)

export function WhiteboardProvider({ children }: { children: ReactNode }) {
  const [scholarships, setScholarships] = useState<ScholarshipData[]>([])
  const [essays, setEssays] = useState<EssayData[]>([])
  const [jsonOutputs, setJsonOutputs] = useState<JsonOutputData[]>([])

  const addScholarship = useCallback((scholarship: Omit<ScholarshipData, 'id'>) => {
    const id = `scholarship-${Date.now()}`
    setScholarships((prev) => [...prev, { ...scholarship, id }])
    return id
  }, [])

  const updateScholarship = useCallback((scholarship: ScholarshipData) => {
    setScholarships((prev) =>
      prev.map((s) => (s.id === scholarship.id ? scholarship : s))
    )
    // Also update corresponding JSON output
    setJsonOutputs((prev) =>
      prev.map((output) =>
        output.scholarshipId === scholarship.id
          ? {
              ...output,
              data: {
                ScholarshipName: scholarship.title,
                ScholarshipDescription: scholarship.description,
                EssayPrompt: scholarship.prompt,
                HiddenRequirements: scholarship.hiddenRequirements,
              },
            }
          : output
      )
    )
  }, [])

  const deleteScholarship = useCallback((scholarshipId: string) => {
    setScholarships((prev) => prev.filter((s) => s.id !== scholarshipId))
    // Also delete related essays and JSON outputs
    setEssays((prev) => prev.filter((e) => e.scholarshipId !== scholarshipId))
    setJsonOutputs((prev) => prev.filter((o) => o.scholarshipId !== scholarshipId))
  }, [])

  const addEssay = useCallback((essay: Omit<EssayData, 'id'>) => {
    const id = `essay-${Date.now()}`
    setEssays((prev) => [...prev, { ...essay, id }])
    return id
  }, [])

  const updateEssay = useCallback((essay: EssayData) => {
    setEssays((prev) => prev.map((e) => (e.id === essay.id ? essay : e)))
  }, [])

  const deleteEssay = useCallback((essayId: string) => {
    setEssays((prev) => prev.filter((e) => e.id !== essayId))
  }, [])

  const addJsonOutput = useCallback((scholarshipId: string, data: JsonOutputData['data']) => {
    const id = `json-${Date.now()}`
    setJsonOutputs((prev) => [...prev, { id, scholarshipId, data }])
    return id
  }, [])

  return (
    <WhiteboardContext.Provider
      value={{
        scholarships,
        essays,
        jsonOutputs,
        addScholarship,
        updateScholarship,
        deleteScholarship,
        addEssay,
        updateEssay,
        deleteEssay,
        addJsonOutput,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  )
}

export function useWhiteboard() {
  const context = useContext(WhiteboardContext)
  if (!context) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider')
  }
  return context
}
