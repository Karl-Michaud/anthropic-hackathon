export interface IScholarshipValues {
  scholarship_id?: string
  title?: string
  values_emphasized: string[] // Core guiding principles (e.g., "creativity", "discipline")
  value_definitions: Record<string, string> // Each value with meaning in context
  evidence_phrases: string[] // Key phrases showing those values
  summary: string // Short summary of what the scholarship values most
  confidence_score: number // 0–100
}
