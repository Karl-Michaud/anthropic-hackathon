// Main component (merged into root level)
export { default as FeedbackPanel } from '../../components/FeedbackPanel'

// Types
export type {
  FeedbackData,
  Question,
  FeedbackSection,
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
  analyzeSocraticQuestions,
  submitSocraticAnswers,
} from './feedbackApi'

export { createDummyFeedbackData } from './dummyData'
