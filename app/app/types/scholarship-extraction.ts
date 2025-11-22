/**
 * Scholarship extraction types for Claude API responses
 */

export type SupportedFileType = 'txt' | 'json' | 'pdf'

export interface ScholarshipExtraction {
  ScholarshipName: string
  ScholarshipDescription: string
  EssayPrompt: string
}
