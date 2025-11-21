'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { ScholarshipData } from '../components/scholarship/ScholarshipBlock'
import { EssayData } from '../components/essay/EssayBlock'

const STORAGE_KEY = 'whiteboard-data'
const DEBOUNCE_MS = 500

export interface CellData {
  id: string
  x: number
  y: number
  color: string
  text: string
  rotation: number
}

export interface BlockPosition {
  id: string
  x: number
  y: number
}

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

interface WhiteboardState {
  cells: CellData[]
  scholarships: ScholarshipData[]
  essays: EssayData[]
  jsonOutputs: JsonOutputData[]
  blockPositions: BlockPosition[]
}

interface WhiteboardContextType {
  // State
  cells: CellData[]
  scholarships: ScholarshipData[]
  essays: EssayData[]
  jsonOutputs: JsonOutputData[]
  blockPositions: BlockPosition[]

  // Cell actions
  addCell: (cell: Omit<CellData, 'id'>) => string
  updateCell: (cell: CellData) => void
  deleteCell: (cellId: string) => void

  // Scholarship actions
  addScholarship: (scholarship: Omit<ScholarshipData, 'id'>) => string
  updateScholarship: (scholarship: ScholarshipData) => void
  deleteScholarship: (scholarshipId: string) => void

  // Essay actions
  addEssay: (essay: Omit<EssayData, 'id'>) => string
  updateEssay: (essay: EssayData) => void
  deleteEssay: (essayId: string) => void

  // JSON output actions
  addJsonOutput: (scholarshipId: string, data: JsonOutputData['data']) => string

  // Position actions
  updateBlockPosition: (id: string, x: number, y: number) => void
  getBlockPosition: (id: string) => BlockPosition

  // Clear all
  clearAll: () => void
}

const defaultState: WhiteboardState = {
  cells: [],
  scholarships: [],
  essays: [],
  jsonOutputs: [],
  blockPositions: [],
}

const WhiteboardContext = createContext<WhiteboardContextType | null>(null)

function loadFromStorage(): WhiteboardState {
  if (typeof window === 'undefined') return defaultState
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load whiteboard data:', error)
  }
  return defaultState
}

function saveToStorage(state: WhiteboardState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save whiteboard data:', error)
  }
}

export function WhiteboardProvider({ children }: { children: ReactNode }) {
  const [cells, setCells] = useState<CellData[]>([])
  const [scholarships, setScholarships] = useState<ScholarshipData[]>([])
  const [essays, setEssays] = useState<EssayData[]>([])
  const [jsonOutputs, setJsonOutputs] = useState<JsonOutputData[]>([])
  const [blockPositions, setBlockPositions] = useState<BlockPosition[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage()
    setCells(stored.cells)
    setScholarships(stored.scholarships)
    setEssays(stored.essays)
    setJsonOutputs(stored.jsonOutputs)
    setBlockPositions(stored.blockPositions)
    setIsLoaded(true)
  }, [])

  // Debounced save to localStorage
  useEffect(() => {
    if (!isLoaded) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage({ cells, scholarships, essays, jsonOutputs, blockPositions })
    }, DEBOUNCE_MS)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [cells, scholarships, essays, jsonOutputs, blockPositions, isLoaded])

  // Cell actions
  const addCell = useCallback((cell: Omit<CellData, 'id'>) => {
    const id = `cell-${Date.now()}`
    setCells((prev) => [...prev, { ...cell, id }])
    return id
  }, [])

  const updateCell = useCallback((cell: CellData) => {
    setCells((prev) => prev.map((c) => (c.id === cell.id ? cell : c)))
  }, [])

  const deleteCell = useCallback((cellId: string) => {
    setCells((prev) => prev.filter((c) => c.id !== cellId))
  }, [])

  // Scholarship actions
  const addScholarship = useCallback((scholarship: Omit<ScholarshipData, 'id'>) => {
    const id = `scholarship-${Date.now()}`
    setScholarships((prev) => [...prev, { ...scholarship, id }])
    return id
  }, [])

  const updateScholarship = useCallback((scholarship: ScholarshipData) => {
    setScholarships((prev) =>
      prev.map((s) => (s.id === scholarship.id ? scholarship : s))
    )
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
    setEssays((prev) => prev.filter((e) => e.scholarshipId !== scholarshipId))
    setJsonOutputs((prev) => prev.filter((o) => o.scholarshipId !== scholarshipId))
    setBlockPositions((prev) => prev.filter((p) => p.id !== scholarshipId))
  }, [])

  // Essay actions
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
    setBlockPositions((prev) => prev.filter((p) => p.id !== essayId))
  }, [])

  // JSON output actions
  const addJsonOutput = useCallback((scholarshipId: string, data: JsonOutputData['data']) => {
    const id = `json-${Date.now()}`
    setJsonOutputs((prev) => [...prev, { id, scholarshipId, data }])
    return id
  }, [])

  // Position actions
  const updateBlockPosition = useCallback((id: string, x: number, y: number) => {
    setBlockPositions((prev) => {
      const existing = prev.find((p) => p.id === id)
      if (existing) {
        return prev.map((p) => (p.id === id ? { ...p, x, y } : p))
      }
      return [...prev, { id, x, y }]
    })
  }, [])

  const getBlockPosition = useCallback(
    (id: string): BlockPosition => {
      return blockPositions.find((p) => p.id === id) || { id, x: 100, y: 100 }
    },
    [blockPositions]
  )

  // Clear all
  const clearAll = useCallback(() => {
    setCells([])
    setScholarships([])
    setEssays([])
    setJsonOutputs([])
    setBlockPositions([])
  }, [])

  return (
    <WhiteboardContext.Provider
      value={{
        cells,
        scholarships,
        essays,
        jsonOutputs,
        blockPositions,
        addCell,
        updateCell,
        deleteCell,
        addScholarship,
        updateScholarship,
        deleteScholarship,
        addEssay,
        updateEssay,
        deleteEssay,
        addJsonOutput,
        updateBlockPosition,
        getBlockPosition,
        clearAll,
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
