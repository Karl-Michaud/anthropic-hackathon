// Core components
export { default as Question } from './core/Question'
export { default as FeedbackSection } from './core/FeedbackSection'
export { default as FeedbackPanel } from './core/FeedbackPanel'

// Types
export type {
  Question as QuestionType,
  FeedbackSection as FeedbackSectionType,
  FeedbackData,
  QuestionProps,
  FeedbackSectionProps,
  FeedbackPanelProps,
} from './types'

// Utilities
export {
  analyzeFeedback,
  submitFeedbackAnswers,
  saveFeedbackDraft,
  loadFeedbackDraft,
  clearFeedbackDraft,
  generateFeedbackId,
} from './utils/feedbackApi'

export { createDummyFeedbackData } from './utils/dummyData'
