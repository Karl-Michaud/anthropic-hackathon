/**
 * User profile types for first-time user questionnaire
 */

// Stored user profile data
export interface IUserProfile {
  firstName: string
  lastName: string
  cvResumeSummary: string
  userSummary: string
  rawData?: {
    cvText: string
    aboutYourself: string
  }
}

// Form input data before AI processing
export interface IUserProfileInput {
  firstName: string
  lastName: string
  cvFile: File | null
  cvText?: string // Parsed text from file
  aboutYourself: string
}

// AI response for profile processing
export interface IUserProfileAIResponse {
  cvResumeSummary: string
  userSummary: string
}
