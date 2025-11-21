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
  id: string
  title: string
  description: string
  prompts?: IPrompt[]
}

export interface IPrompt {
  id: string
  text: string
  scholarshipId: string
  scholarship?: IScholarship

  promptHiddenCriteria?: IPromptHiddenCriteria
  promptPersonality?: IPromptPersonality
  promptPriorities?: IPromptPriorities
  promptValues?: IPromptValues
  generateDraft?: IGenerateDraft
}

export interface IPromptHiddenCriteria {
  id: string
  scholarshipHiddenCriteriaId?: string
  trait: string
  rationale: string
  evidencePhrases: string[]
  importance: ImportanceLevel

  promptId: string
  prompt?: IPrompt
}

export interface IPromptPersonality {
  id: string
  spirit: string
  toneStyle: string
  valuesEmphasized: string[]
  recommendedEssayFocus: string

  promptId: string
  prompt?: IPrompt
}

export interface IPromptPriorities {
  id: string
  primaryFocus: PrimaryFocus
  priorityWeights: Record<string, number>

  promptId: string
  prompt?: IPrompt
}

export interface IPromptValues {
  id: string
  valuesEmphasized: string[]
  valueDefinitions: Record<string, string>
  evidencePhrases: string[]

  promptId: string
  prompt?: IPrompt
}

export interface IGenerateDraft {
  id: string
  essay: string

  promptId: string
  prompt?: IPrompt
}
