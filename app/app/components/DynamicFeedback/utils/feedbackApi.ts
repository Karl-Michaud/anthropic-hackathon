'use client'

import { FeedbackData } from '../types'
import {
  HighlightedSection,
  SocraticQuestion,
} from '../../../context/WhiteboardContext'
import {
  analyzeSocratic,
  submitSocraticAnswers as submitSocraticLib,
} from '../../../lib/socratic'
import {
  analyzeFeedback as analyzeFeedbackLib,
  submitFeedback as submitFeedbackLib,
} from '../../../lib/feedback'

interface SocraticAnalysisResult {
  highlightedSections: HighlightedSection[]
  socraticData: Record<string, SocraticQuestion[]>
}

/**
 * Analyze essay and return highlighted sections with Socratic questions
 */
export async function analyzeSocraticQuestions(
  essayContent: string,
  scholarshipTitle?: string,
): Promise<SocraticAnalysisResult> {
  try {
    const result = await analyzeSocratic(essayContent, scholarshipTitle)
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
    const updatedEssay = await submitSocraticLib(essayContent, answers)
    return updatedEssay || essayContent
  } catch (error) {
    console.error('Error submitting Socratic answers:', error)
    return essayContent
  }
}

/**
 * Analyze essay and return feedback data with improvement suggestions
 */
export async function analyzeFeedback(
  essayContent: string,
  essayId: string,
  scholarshipId: string,
  scholarshipTitle?: string,
): Promise<FeedbackData | null> {
  try {
    const feedbackData = await analyzeFeedbackLib({
      essayContent,
      essayId,
      scholarshipId,
      scholarshipTitle,
    })
    return feedbackData || null
  } catch (error) {
    console.error('Error analyzing essay for feedback:', error)
    return null
  }
}

/**
 * Submit completed feedback answers to update essay
 */
export async function submitFeedbackAnswers(
  feedbackData: FeedbackData,
  essayContent: string,
): Promise<string> {
  try {
    const updatedEssay = await submitFeedbackLib(essayContent, feedbackData)
    return updatedEssay || essayContent
  } catch (error) {
    console.error('Error submitting feedback answers:', error)
    throw error
  }
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
