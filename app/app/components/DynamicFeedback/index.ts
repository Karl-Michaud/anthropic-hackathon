// Main component (merged into root level)
export { default as FeedbackPanel } from '../FeedbackPanel'

// Types
export type {
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
