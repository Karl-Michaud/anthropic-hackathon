export interface IScholarshipPriorities {
  scholarship_id?: string
  title?: string
  primary_focus:
    | 'merit'
    | 'community'
    | 'innovation'
    | 'leadership'
    | 'academic_excellence'
    | 'equity'
    | 'other'
  priority_weights: Record<string, number> // e.g., { "innovation": 40, "community": 30 }
  selection_signals: string[] // Key words or signals of high priority
  success_profile: string // Type of student most likely to win
  summary: string
  confidence_score: number
}
