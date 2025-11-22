'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react'
import { FeedbackData } from '../lib/dynamicFeedback'
import {
  saveFeedbackDraft,
  loadFeedbackDraft,
  clearFeedbackDraft,
} from '../lib/dynamicFeedback'

const STORAGE_KEY = 'whiteboard-data'
const DEBOUNCE_MS = 500

export interface AdaptiveWeightCategory {
  weight: number
  subweights: Record<string, number>
}

export interface CellData {
  id: string
  x: number
  y: number
  color: string
  text: string
  rotation: number
}

export interface ScholarshipData {
  id: string
  title: string
  description: string
  prompt: string
  personality?: Record<string, unknown>
  priorities?: Record<string, unknown>
  values?: Record<string, unknown>
  weights?: Record<string, unknown>
}

export interface HighlightedSection {
  id: string
  startIndex: number
  endIndex: number
  color: string
  title: string
  colorName: 'amber' | 'cyan' | 'pink' | 'lime' | 'purple'
}

export interface SocraticQuestion {
  id: string
  text: string
  answer: string
}

export interface EssayData {
  id: string
  scholarshipId: string
  content: string
  maxWordCount?: number
  highlightedSections?: HighlightedSection[]
  socraticData?: Record<string, SocraticQuestion[]>
  lastEditedAt?: number
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
    Personality?: Record<string, unknown>
    Priorities?: Record<string, unknown>
    Values?: Record<string, unknown>
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
  feedbackPanels: FeedbackData[]
  blockPositions: BlockPosition[]

  // Cell actions
  addCell: (cell: Omit<CellData, 'id'>) => string
  updateCell: (cell: CellData) => void
  deleteCell: (cellId: string) => void

  // Scholarship actions
  addScholarship: (
    scholarship: Omit<ScholarshipData, 'id'> & { id?: string },
  ) => string
  updateScholarship: (scholarship: ScholarshipData) => void
  deleteScholarship: (scholarshipId: string) => void

  // Essay actions
  addEssay: (essay: Omit<EssayData, 'id'>) => string
  updateEssay: (essay: EssayData) => void
  deleteEssay: (essayId: string) => void

  // JSON output actions
  addJsonOutput: (scholarshipId: string, data: JsonOutputData['data']) => string
  deleteJsonOutput: (jsonOutputId: string) => void

  // Feedback panel actions
  addFeedbackPanel: (feedbackData: FeedbackData) => void
  updateFeedbackPanel: (
    feedbackId: string,
    updates: Partial<FeedbackData>,
  ) => void
  deleteFeedbackPanel: (feedbackId: string) => void

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
  const [feedbackPanels, setFeedbackPanels] = useState<FeedbackData[]>([])
  const [blockPositions, setBlockPositions] = useState<BlockPosition[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage after hydration (client-side only)
  useEffect(() => {
    const stored = loadFromStorage()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCells(stored.cells)
    setScholarships(stored.scholarships)
    setEssays(stored.essays)
    setJsonOutputs(stored.jsonOutputs)
    setBlockPositions(stored.blockPositions)

    // Load feedback panel drafts separately
    const feedbackDrafts: FeedbackData[] = []
    stored.essays.forEach((essay) => {
      const draft = loadFeedbackDraft(essay.id)
      if (draft) {
        feedbackDrafts.push(draft)
      }
    })
    setFeedbackPanels(feedbackDrafts)

    setIsLoaded(true)
  }, [])

  // Debounced save to localStorage (only after hydration)
  useEffect(() => {
    if (!isLoaded) return
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage({
        cells,
        scholarships,
        essays,
        jsonOutputs,
        blockPositions,
      })
    }, DEBOUNCE_MS)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [cells, scholarships, essays, jsonOutputs, blockPositions, isLoaded])

  // Cell actions
  const addCell = useCallback((cell: Omit<CellData, 'id'>) => {
    const id = `cell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
  const addScholarship = useCallback(
    (scholarship: Omit<ScholarshipData, 'id'> & { id?: string }) => {
      const id = scholarship.id || `scholarship-${Date.now()}`
      setScholarships((prev) => [...prev, { ...scholarship, id }])
      return id
    },
    [],
  )

  const updateScholarship = useCallback((scholarship: ScholarshipData) => {
    setScholarships((prev) =>
      prev.map((s) => (s.id === scholarship.id ? scholarship : s)),
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
              },
            }
          : output,
      ),
    )
  }, [])

  const deleteScholarship = useCallback((scholarshipId: string) => {
    setScholarships((prev) => prev.filter((s) => s.id !== scholarshipId))
    setEssays((prev) => prev.filter((e) => e.scholarshipId !== scholarshipId))
    setJsonOutputs((prev) =>
      prev.filter((o) => o.scholarshipId !== scholarshipId),
    )
    setBlockPositions((prev) => prev.filter((p) => p.id !== scholarshipId))
  }, [])

  // Essay actions
  const addEssay = useCallback((essay: Omit<EssayData, 'id'>) => {
    const id = `essay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
  const addJsonOutput = useCallback(
    (scholarshipId: string, data: JsonOutputData['data']) => {
      const id = `json-${Date.now()}`
      setJsonOutputs((prev) => [...prev, { id, scholarshipId, data }])
      return id
    },
    [],
  )

  const deleteJsonOutput = useCallback((jsonOutputId: string) => {
    setJsonOutputs((prev) => prev.filter((o) => o.id !== jsonOutputId))
    setBlockPositions((prev) => prev.filter((p) => p.id !== jsonOutputId))
  }, [])

  // Position actions
  const updateBlockPosition = useCallback(
    (id: string, x: number, y: number) => {
      setBlockPositions((prev) => {
        const existing = prev.find((p) => p.id === id)
        if (existing) {
          return prev.map((p) => (p.id === id ? { ...p, x, y } : p))
        }
        return [...prev, { id, x, y }]
      })
    },
    [],
  )

  const getBlockPosition = useCallback(
    (id: string): BlockPosition => {
      return blockPositions.find((p) => p.id === id) || { id, x: 100, y: 100 }
    },
    [blockPositions],
  )

  // Feedback panel actions
  const addFeedbackPanel = useCallback((feedbackData: FeedbackData) => {
    setFeedbackPanels((prev) => [...prev, feedbackData])
    saveFeedbackDraft(feedbackData) // Auto-save to localStorage
  }, [])

  const updateFeedbackPanel = useCallback(
    (feedbackId: string, updates: Partial<FeedbackData>) => {
      setFeedbackPanels((prev) =>
        prev.map((panel) =>
          panel.id === feedbackId ? { ...panel, ...updates } : panel,
        ),
      )
      // Auto-save updated panel
      setFeedbackPanels((prev) => {
        const updatedPanel = prev.find((p) => p.id === feedbackId)
        if (updatedPanel) {
          saveFeedbackDraft({ ...updatedPanel, ...updates })
        }
        return prev
      })
    },
    [],
  )

  const deleteFeedbackPanel = useCallback((feedbackId: string) => {
    setFeedbackPanels((prev) => {
      const panel = prev.find((p) => p.id === feedbackId)
      if (panel) {
        clearFeedbackDraft(panel.essayId)
      }
      return prev.filter((p) => p.id !== feedbackId)
    })
    setBlockPositions((prev) => prev.filter((p) => p.id !== feedbackId))
  }, [])

  // Clear all
  const clearAll = useCallback(() => {
    setCells([])
    setScholarships([])
    setEssays([])
    setJsonOutputs([])
    setFeedbackPanels([])
    setBlockPositions([])
  }, [])

  return (
    <WhiteboardContext.Provider
      value={{
        cells,
        scholarships,
        essays,
        jsonOutputs,
        feedbackPanels,
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
        deleteJsonOutput,
        addFeedbackPanel,
        updateFeedbackPanel,
        deleteFeedbackPanel,
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
