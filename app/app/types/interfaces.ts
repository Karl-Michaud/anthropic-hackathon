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
