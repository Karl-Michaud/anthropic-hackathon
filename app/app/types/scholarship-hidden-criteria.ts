export interface IScholarshipHiddenCriteria {
  scholarship_id?: string
  title?: string
  implicit_criteria: Array<{
    trait: string // e.g., "Hands-on experimentation"
    rationale: string // Why inferred
    evidence_phrases: string[] // Supporting text snippets
    importance: 'high' | 'medium' | 'low'
  }>
  overall_pattern: string // General theme or bias
  summary: string
  confidence_score: number
}
