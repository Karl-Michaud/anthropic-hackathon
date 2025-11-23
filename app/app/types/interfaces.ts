export enum ImportanceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum PrimaryFocus {
  MERIT = 'MERIT',
  COMMUNITY = 'COMMUNITY',
  INNOVATION = 'INNOVATION',
  LEADERSHIP = 'LEADERSHIP',
  ACADEMIC_EXCELLENCE = 'ACADEMIC_EXCELLENCE',
  EQUITY = 'EQUITY',
  OTHER = 'OTHER',
}

export interface IScholarship {
  id?: string
  title: string
  description: string
  prompt: string

  promptPersonality?: IPromptPersonality
  promptPriority?: IPromptPriority
  promptValue?: IPromptValues
  promptWeights?: IPromptWeights
  generateDraft?: IGenerateDraft
}

export interface IPrompt {
  text: string
  scholarship?: IScholarship

  promptPersonality?: IPromptPersonality
  promptPriority?: IPromptPriority
  promptValue?: IPromptValues
  generateDraft?: IGenerateDraft
}

export interface IPromptPersonality {
  personality_profile: {
    core_identity: string
    tone_style: string
    communication_strategy: string
    values_emphasized: string[]
    recommended_essay_focus: string
    contrast_examples: {
      vs_merit_academic: string
      vs_service: string
    }
  }
}

export interface IPromptPriority {
  primary_focus: string
  priority_weights: Record<string, number>
  selection_signals: string[]
  success_profile: string
  summary: string
  confidence_score: number
}

export interface IPromptValues {
  values_emphasized: string[]
  value_definitions: Record<string, string>
  evidence_phrases: string[]
  summary: string
  confidence_score: number
}

export interface IPromptWeights {
  [category: string]: {
    weight: number
    subweights: {
      [subcategory: string]: number
    }
  }
}

export interface IGenerateDraft {
  essay: string
}

export interface ICustomDraftAnalysis {
  overall_alignment_score: number
  personality_alignment: {
    score: number
    matches: string[]
    gaps: string[]
    suggestions: string[]
  }
  priorities_alignment: {
    score: number
    well_addressed: string[]
    needs_attention: string[]
    suggestions: string[]
  }
  values_alignment: {
    score: number
    demonstrated_values: string[]
    missing_values: string[]
    suggestions: string[]
  }
  weights_alignment: {
    score: number
    strong_categories: string[]
    weak_categories: string[]
    suggestions: string[]
  }
  key_strengths: string[]
  critical_improvements: string[]
  summary: string
}
