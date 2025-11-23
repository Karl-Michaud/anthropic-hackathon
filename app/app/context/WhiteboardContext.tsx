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
import { FeedbackData } from '../lib/dynamicFeedback/types'
import {
  saveFeedbackDraft,
  loadFeedbackDraft,
  clearFeedbackDraft,
} from '../lib/dynamicFeedback'
import { syncManager, type SyncStatus } from '../lib/syncManager'
import { useAuth } from '../components/auth/AuthProvider'
import { IUserProfile } from '../types/user-profile'
import {
  saveUserProfile as saveUserProfileToDb,
  getUserProfile,
  isFirstTimeUser as checkFirstTimeUser,
} from '../lib/supabase/queries'

const STORAGE_KEY_PREFIX = 'whiteboard-data'
const DEBOUNCE_MS = 500

// Get user-specific storage key
function getStorageKey(userId?: string): string {
  if (!userId) return `${STORAGE_KEY_PREFIX}-anonymous`
  return `${STORAGE_KEY_PREFIX}-${userId}`
}

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
  explanation?: string
  colorName: 'amber' | 'cyan' | 'pink' | 'lime' | 'purple'
  areasOfImprovement?: string[] // For custom drafts - specific areas to improve
}

export interface SocraticQuestion {
  id: string
  text: string
  answer: string
}

export interface CustomDraftAnalysis {
  overall_alignment_score: number
  personality_alignment: {
    score: number
    matches: string[]
    gaps: string[]
    suggestions: string[]
  }
  priorities_alignment: {
    score: number
    well_addressed: string[]
    needs_attention: string[]
    suggestions: string[]
  }
  values_alignment: {
    score: number
    demonstrated_values: string[]
    missing_values: string[]
    suggestions: string[]
  }
  weights_alignment: {
    score: number
    strong_categories: string[]
    weak_categories: string[]
    suggestions: string[]
  }
  key_strengths: string[]
  critical_improvements: string[]
  summary: string
}

export interface EssayData {
  id: string
  scholarshipId: string
  content: string
  maxWordCount?: number
  highlightedSections?: HighlightedSection[]
  socraticData?: Record<string, SocraticQuestion[]>
  customDraftAnalysis?: CustomDraftAnalysis
  lastEditedAt?: number
  isCustomDraft?: boolean
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
  syncStatus: SyncStatus
  userProfile: IUserProfile | null
  isFirstTimeUser: boolean
  hasCheckedFirstTimeUser: boolean

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

  // User profile actions
  setUserProfile: (profile: IUserProfile) => Promise<void>
  completeOnboarding: () => void

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

function loadFromStorage(userId?: string): WhiteboardState {
  if (typeof window === 'undefined') return defaultState
  try {
    const key = getStorageKey(userId)
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load whiteboard data:', error)
  }
  return defaultState
}

function saveToStorage(state: WhiteboardState, userId?: string) {
  if (typeof window === 'undefined') return
  try {
    const key = getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(state))
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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [userProfile, setUserProfileState] = useState<IUserProfile | null>(null)
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(false)
  const [hasCheckedFirstTimeUser, setHasCheckedFirstTimeUser] = useState<boolean>(false)

  const { user } = useAuth()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousUserIdRef = useRef<string | undefined>(undefined)

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = syncManager.onStatusChange(setSyncStatus)
    return unsubscribe
  }, [])

  // Reset state when user changes (logout or switch accounts)
  useEffect(() => {
    const currentUserId = user?.id
    const previousUserId = previousUserIdRef.current

    // If user changed (not initial load), reset state
    if (previousUserId !== undefined && previousUserId !== currentUserId) {
      console.log('User changed, resetting state...')

      // Cancel any pending saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      syncManager.cancelPendingSync()

      setIsLoaded(false)
      setCells([])
      setScholarships([])
      setEssays([])
      setJsonOutputs([])
      setBlockPositions([])
      setFeedbackPanels([])
      setUserProfileState(null)
      setIsFirstTimeUser(false)
      setHasCheckedFirstTimeUser(false)
    }

    previousUserIdRef.current = currentUserId
  }, [user?.id])

  // Load from localStorage after hydration (client-side only)
  useEffect(() => {
    async function loadData() {
      // Load from user-specific localStorage
      const stored = loadFromStorage(user?.id)

      // If user-specific localStorage is empty and user is logged in, try to restore from database
      const hasLocalData =
        stored.cells.length > 0 ||
        stored.scholarships.length > 0 ||
        stored.essays.length > 0

      if (!hasLocalData && user) {
        console.log('No local data found for user, loading from database...')
        const dbData = await syncManager.loadFromDatabase(user.id)
        if (dbData) {
          console.log('Loaded data from database')
          setCells(dbData.cells as CellData[])
          setScholarships(dbData.scholarships as ScholarshipData[])
          setEssays(dbData.essays as EssayData[])
          setJsonOutputs(dbData.jsonOutputs as JsonOutputData[])
          setBlockPositions(dbData.blockPositions as BlockPosition[])
          setIsLoaded(true)
        }
      }

      // Load user profile and first-time status if user is logged in
      if (user) {
        const [profile, firstTime] = await Promise.all([
          getUserProfile(user.id),
          checkFirstTimeUser(user.id),
        ])
        setUserProfileState(profile)
        setIsFirstTimeUser(firstTime)
        setHasCheckedFirstTimeUser(true)

        if (!hasLocalData && profile) {
          setIsLoaded(true)
          return
        }
      } else {
        // If no user is logged in, we've "checked" and they're not a first-time user
        setHasCheckedFirstTimeUser(true)
      }

      // Use user-specific localStorage data
      console.log(
        'Loading from user-specific localStorage:',
        user?.id || 'anonymous',
      )
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
    }

    loadData()
  }, [user])

  // Debounced save to localStorage and database (only after hydration)
  useEffect(() => {
    if (!isLoaded) return
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    const whiteboardData = {
      cells,
      scholarships,
      essays,
      jsonOutputs,
      blockPositions,
    }

    saveTimeoutRef.current = setTimeout(() => {
      // Always save to user-specific localStorage (instant backup)
      saveToStorage(whiteboardData, user?.id)

      // If user is logged in, also sync to database (debounced)
      if (user?.id) {
        syncManager.debouncedSave(user.id, whiteboardData)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [cells, scholarships, essays, jsonOutputs, blockPositions, isLoaded, user])

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
    console.log('📝 [WhiteboardContext.addEssay] Creating new essay:', {
      id,
      scholarshipId: essay.scholarshipId,
      isCustomDraft: essay.isCustomDraft || false,
      contentLength: essay.content.length,
    })
    setEssays((prev) => {
      const newEssays = [...prev, { ...essay, id }]
      console.log('  - Total essays after add:', newEssays.length)
      return newEssays
    })
    console.log('  - ✅ Essay added to context')
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
      console.log('📍 [WhiteboardContext.updateBlockPosition] Updating position:', {
        id,
        x,
        y,
      })
      setBlockPositions((prev) => {
        const existing = prev.find((p) => p.id === id)
        if (existing) {
          console.log('  - Existing position found, updating:', existing)
          return prev.map((p) => (p.id === id ? { ...p, x, y } : p))
        }
        console.log('  - No existing position, creating new')
        return [...prev, { id, x, y }]
      })
      console.log('  - ✅ Position updated')
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

  // User profile actions
  const setUserProfile = useCallback(
    async (profile: IUserProfile) => {
      setUserProfileState(profile)
      setIsFirstTimeUser(false)

      // Save to database if user is logged in
      if (user?.id) {
        try {
          await saveUserProfileToDb(user.id, profile)
        } catch (error) {
          console.error('Error saving user profile to database:', error)
        }
      }

      // Also save to localStorage
      if (typeof window !== 'undefined') {
        const key = getStorageKey(user?.id)
        try {
          const stored = localStorage.getItem(key)
          const data = stored ? JSON.parse(stored) : defaultState
          data.userProfile = profile
          localStorage.setItem(key, JSON.stringify(data))
        } catch (error) {
          console.error('Error saving user profile to localStorage:', error)
        }
      }
    },
    [user?.id],
  )

  const completeOnboarding = useCallback(() => {
    setIsFirstTimeUser(false)
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
        syncStatus,
        userProfile,
        isFirstTimeUser,
        hasCheckedFirstTimeUser,
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
        setUserProfile,
        completeOnboarding,
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
