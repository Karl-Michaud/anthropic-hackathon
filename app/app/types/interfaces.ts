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
  title: string
  description: string
  prompts?: IPrompt[]
}

export interface IPrompt {
  text: string
  scholarship?: IScholarship

  promptHiddenCriteria?: IPromptHiddenCriteria
  promptPersonality?: IPromptPersonality
  promptPriorities?: IPromptPriorities
  promptValues?: IPromptValues
  generateDraft?: IGenerateDraft
}

export interface IPromptHiddenCriteria {
  scholarshipHiddenCriteriaId?: string
  trait: string
  rationale: string
  evidencePhrases: string[]
  importance: ImportanceLevel
}

export interface IPromptPersonality {
  spirit: string
  toneStyle: string
  valuesEmphasized: string[]
  recommendedEssayFocus: string
}

export interface IPromptPriorities {
  primaryFocus: PrimaryFocus
  priorityWeights: Record<string, number>
}

export interface IPromptValues {
  valuesEmphasized: string[]
  valueDefinitions: Record<string, string>
  evidencePhrases: string[]
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
