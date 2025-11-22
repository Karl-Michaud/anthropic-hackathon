import { FeedbackData } from '../types'

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
