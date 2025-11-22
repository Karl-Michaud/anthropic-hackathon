import { FeedbackData } from '../types'
import {
  HighlightedSection,
  SocraticQuestion,
} from '../../../context/WhiteboardContext'

interface SocraticAnalysisResult {
  highlightedSections: HighlightedSection[]
  socraticData: Record<string, SocraticQuestion[]>
}

const HIGHLIGHT_COLORS = ['amber', 'cyan', 'pink', 'lime', 'purple'] as const

/**
 * Analyze essay and return highlighted sections with Socratic questions
 */
export async function analyzeSocraticQuestions(
  essayContent: string,
  scholarshipTitle?: string,
): Promise<SocraticAnalysisResult> {
  try {
    const response = await fetch('/api/socratic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essayContent,
        scholarshipTitle,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to analyze essay for Socratic questions')
    }

    const result = await response.json()
    return {
      highlightedSections: result.highlightedSections || [],
      socraticData: result.socraticData || {},
    }
  } catch (error) {
    console.error('Error analyzing Socratic questions:', error)
    return {
      highlightedSections: [],
      socraticData: {},
    }
  }
}

/**
 * Submit Socratic answers to update essay
 */
export async function submitSocraticAnswers(
  essayContent: string,
  sectionId: string,
  answers: Record<string, string>,
): Promise<string> {
  try {
    const response = await fetch('/api/socratic/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essayContent,
        sectionId,
        answers,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit Socratic answers')
    }

    const result = await response.json()
    return result.updatedEssay || essayContent
  } catch (error) {
    console.error('Error submitting Socratic answers:', error)
    return essayContent
  }
}

/**
 * Analyze essay and return feedback data
 * STUB: Returns null for now
 * FUTURE: Call AI to analyze essay against requirements
 */
export async function analyzeFeedback(
  essayId: string,
  scholarshipId: string,
): Promise<FeedbackData | null> {
  // TODO: Implement AI analysis
  console.log('analyzeFeedback called:', { essayId, scholarshipId })
  return null
}

/**
 * Submit completed feedback answers to AI
 * STUB: Console logs data for now
 * FUTURE: Send to backend/AI pipeline
 */
export async function submitFeedbackAnswers(
  feedbackData: FeedbackData,
): Promise<void> {
  // TODO: Implement submission to backend
  console.log('submitFeedbackAnswers called:', feedbackData)

  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}

/**
 * Auto-save feedback progress to localStorage
 */
export function saveFeedbackDraft(feedbackData: FeedbackData): void {
  try {
    const key = `feedback-draft-${feedbackData.essayId}`
    localStorage.setItem(key, JSON.stringify(feedbackData))
  } catch (error) {
    console.error('Failed to save feedback draft:', error)
  }
}

/**
 * Load saved feedback draft from localStorage
 */
export function loadFeedbackDraft(essayId: string): FeedbackData | null {
  try {
    const key = `feedback-draft-${essayId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load feedback draft:', error)
    return null
  }
}

/**
 * Clear feedback draft after successful submission
 */
export function clearFeedbackDraft(essayId: string): void {
  try {
    const key = `feedback-draft-${essayId}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear feedback draft:', error)
  }
}

/**
 * Generate a unique ID for feedback panels
 */
export function generateFeedbackId(): string {
  return `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
