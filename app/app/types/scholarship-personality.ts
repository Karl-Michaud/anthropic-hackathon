export interface IScholarshipPersonality {
  personality_profile: {
    core_identity: string
    tone_style: string
    communication_strategy: string
    values_emphasized: string[]
    hidden_criteria: string[]
    recommended_essay_focus: string
    contrast_examples: {
      vs_merit_academic: string
      vs_service: string
    }
  }
}
