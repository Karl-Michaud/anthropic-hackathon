'use server'

import { prisma } from './prisma'
import { generateAllPromptAnalysis } from './request'
import type {
  IPromptHiddenCriteria,
  IPromptPersonality,
  IPromptPriorities,
  IPromptValues,
  IPromptWeights,
  // IGenerateDraft,
} from '../types/interfaces'
import { ImportanceLevel } from '../types/interfaces'

export interface ScholarshipRecord {
  id: string
  title: string
  description: string
  created_at?: string
  updated_at?: string
}

export interface PromptRecord {
  id: string
  text: string
  scholarship_id: string
  created_at?: string
  updated_at?: string
}

export async function saveScholarshipToDB(
  title: string,
  description: string,
  prompts: string[],
) {
  try {
    const scholarship = await prisma.scholarship.create({
      data: {
        title,
        description,
        prompts: {
          create: prompts.map((text) => ({
            text,
          })),
        },
      },
      include: {
        prompts: true,
      },
    })

    return scholarship
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function getScholarshipsFromDB() {
  try {
    const scholarships = await prisma.scholarship.findMany({
      include: {
        prompts: true,
      },
    })

    return scholarships
  } catch (error) {
    console.error('Error fetching scholarships:', error)
    return []
  }
}

export async function getScholarshipFromDB(id: string) {
  try {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        prompts: true,
      },
    })

    return scholarship
  } catch (error) {
    console.error('Error fetching scholarship:', error)
    return null
  }
}

export async function deleteScholarshipFromDB(id: string): Promise<void> {
  try {
    await prisma.prompt.deleteMany({
      where: {
        scholarshipId: id,
      },
    })

    await prisma.scholarship.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error deleting scholarship:', error)
    throw new Error(`Failed to delete scholarship: ${(error as Error).message}`)
  }
}

export async function updateScholarshipInSupabase(
  id: string,
  updates: Partial<ScholarshipRecord>,
) {
  try {
    const scholarship = await prisma.scholarship.update({
      where: { id },
      data: updates,
      include: {
        prompts: true,
      },
    })

    return scholarship
  } catch (error) {
    console.error('Error updating scholarship:', error)
    return null
  }
}

export async function saveEssayDraftToDB(
  scholarshipId: string,
  promptIndex: number,
  content: string,
): Promise<void> {
  try {
    const prompts = await prisma.prompt.findMany({
      where: {
        scholarshipId,
      },
    })

    if (!prompts || !prompts[promptIndex]) {
      throw new Error('Prompt not found')
    }

    const promptId = prompts[promptIndex].id

    // Check if draft exists
    const existingDraft = await prisma.generateDraft.findUnique({
      where: {
        promptId,
      },
    })

    if (existingDraft) {
      // Update existing draft
      await prisma.generateDraft.update({
        where: { promptId },
        data: { essay: content },
      })
    } else {
      // Create new draft
      await prisma.generateDraft.create({
        data: {
          essay: content,
          promptId,
        },
      })
    }
  } catch (error) {
    console.error('Error saving essay draft:', error)
    throw new Error(`Failed to save essay draft: ${(error as Error).message}`)
  }
}

export async function getEssayDraftFromDB(
  scholarshipId: string,
  promptIndex: number,
): Promise<string | null> {
  try {
    const prompts = await prisma.prompt.findMany({
      where: {
        scholarshipId,
      },
    })

    if (!prompts || !prompts[promptIndex]) {
      return null
    }

    const promptId = prompts[promptIndex].id

    const draft = await prisma.generateDraft.findUnique({
      where: {
        promptId,
      },
    })

    return draft?.essay || null
  } catch (error) {
    console.error('Error fetching essay draft:', error)
    return null
  }
}

export async function savePromptHiddenCriteriaToDB(
  promptId: string,
  data: IPromptHiddenCriteria,
): Promise<void> {
  try {
    // Use the first criterion from the array
    if (!data.implicit_criteria || data.implicit_criteria.length === 0) {
      return
    }

    const criterion = data.implicit_criteria[0]

    // Map string importance to enum
    const importanceMap: Record<string, ImportanceLevel> = {
      high: ImportanceLevel.HIGH,
      HIGH: ImportanceLevel.HIGH,
      medium: ImportanceLevel.MEDIUM,
      MEDIUM: ImportanceLevel.MEDIUM,
      low: ImportanceLevel.LOW,
      LOW: ImportanceLevel.LOW,
    }

    const importance =
      importanceMap[criterion.importance] || ImportanceLevel.MEDIUM

    const existingCriteria = await prisma.promptHiddenCriteria.findUnique({
      where: { promptId },
    })

    if (existingCriteria) {
      await prisma.promptHiddenCriteria.update({
        where: { promptId },
        data: {
          trait: criterion.trait,
          rationale: criterion.rationale,
          evidencePhrases: criterion.evidence_phrases,
          importance,
        },
      })
    } else {
      await prisma.promptHiddenCriteria.create({
        data: {
          promptId,
          trait: criterion.trait,
          rationale: criterion.rationale,
          evidencePhrases: criterion.evidence_phrases,
          importance,
        },
      })
    }
  } catch (error) {
    console.error('Error saving hidden criteria:', error)
    throw new Error(
      `Failed to save hidden criteria: ${(error as Error).message}`,
    )
  }
}

export async function savePromptPersonalityToDB(
  promptId: string,
  data: IPromptPersonality,
): Promise<void> {
  try {
    const profile = data.personality_profile

    const existingPersonality = await prisma.promptPersonality.findUnique({
      where: { promptId },
    })

    if (existingPersonality) {
      await prisma.promptPersonality.update({
        where: { promptId },
        data: {
          spirit: profile.core_identity,
          toneStyle: profile.tone_style,
          valuesEmphasized: profile.values_emphasized,
          recommendedEssayFocus: profile.recommended_essay_focus,
        },
      })
    } else {
      await prisma.promptPersonality.create({
        data: {
          promptId,
          spirit: profile.core_identity,
          toneStyle: profile.tone_style,
          valuesEmphasized: profile.values_emphasized,
          recommendedEssayFocus: profile.recommended_essay_focus,
        },
      })
    }
  } catch (error) {
    console.error('Error saving personality:', error)
    throw new Error(`Failed to save personality: ${(error as Error).message}`)
  }
}

export async function savePromptPrioritiesToDB(
  promptId: string,
  data: IPromptPriorities,
): Promise<void> {
  try {
    // Map string primary_focus to enum
    const primaryFocusMap: Record<string, string> = {
      merit: 'MERIT',
      MERIT: 'MERIT',
      community: 'COMMUNITY',
      COMMUNITY: 'COMMUNITY',
      innovation: 'INNOVATION',
      INNOVATION: 'INNOVATION',
      leadership: 'LEADERSHIP',
      LEADERSHIP: 'LEADERSHIP',
      academic_excellence: 'ACADEMIC_EXCELLENCE',
      ACADEMIC_EXCELLENCE: 'ACADEMIC_EXCELLENCE',
      equity: 'EQUITY',
      EQUITY: 'EQUITY',
      other: 'OTHER',
      OTHER: 'OTHER',
    }

    const primaryFocusValue = (primaryFocusMap[data.primary_focus] ||
      'OTHER') as any

    const existingPriorities = await prisma.promptPriorities.findUnique({
      where: { promptId },
    })

    if (existingPriorities) {
      await prisma.promptPriorities.update({
        where: { promptId },
        data: {
          primaryFocus: primaryFocusValue,
          priorityWeights: data.priority_weights,
        },
      })
    } else {
      await prisma.promptPriorities.create({
        data: {
          promptId,
          primaryFocus: primaryFocusValue,
          priorityWeights: data.priority_weights,
        },
      })
    }
  } catch (error) {
    console.error('Error saving priorities:', error)
    throw new Error(`Failed to save priorities: ${(error as Error).message}`)
  }
}

export async function savePromptValuesToDB(
  promptId: string,
  data: IPromptValues,
): Promise<void> {
  try {
    const existingValues = await prisma.promptValues.findUnique({
      where: { promptId },
    })

    if (existingValues) {
      await prisma.promptValues.update({
        where: { promptId },
        data: {
          valuesEmphasized: data.values_emphasized,
          valueDefinitions: data.value_definitions,
          evidencePhrases: data.evidence_phrases,
        },
      })
    } else {
      await prisma.promptValues.create({
        data: {
          promptId,
          valuesEmphasized: data.values_emphasized,
          valueDefinitions: data.value_definitions,
          evidencePhrases: data.evidence_phrases,
        },
      })
    }
  } catch (error) {
    console.error('Error saving values:', error)
    throw new Error(`Failed to save values: ${(error as Error).message}`)
  }
}

export async function savePromptWeightsToDB(
  promptId: string,
  data: IPromptWeights,
): Promise<void> {
  try {
    const existingWeights = await prisma.promptWeights.findUnique({
      where: { promptId },
    })

    if (existingWeights) {
      await prisma.promptWeights.update({
        where: { promptId },
        data: {
          weights: data, // store the whole weight structure
        },
      })
    } else {
      await prisma.promptWeights.create({
        data: {
          promptId,
          weights: data,
        },
      })
    }
  } catch (error) {
    console.error('Error saving weights:', error)
    throw new Error(`Failed to save weights: ${(error as Error).message}`)
  }
}

export async function saveGenerateDraftToDB(
  promptId: string,
  essay: string,
): Promise<void> {
  try {
    const existingDraft = await prisma.generateDraft.findUnique({
      where: { promptId },
    })

    if (existingDraft) {
      await prisma.generateDraft.update({
        where: { promptId },
        data: { essay },
      })
    } else {
      await prisma.generateDraft.create({
        data: {
          promptId,
          essay,
        },
      })
    }
  } catch (error) {
    console.error('Error saving draft:', error)
    throw new Error(`Failed to save draft: ${(error as Error).message}`)
  }
}

export async function generateAndSavePromptAnalysis(
  scholarshipId: string,
  scholarshipTitle: string,
  scholarshipDescription: string,
  prompts: string[],
): Promise<void> {
  try {
    // Get the prompts from the database
    const dbPrompts = await prisma.prompt.findMany({
      where: { scholarshipId },
    })

    // Generate and save analysis for each prompt
    await Promise.all(
      dbPrompts.map(async (dbPrompt, index) => {
        const promptText = prompts[index] || dbPrompt.text

        const analysis = await generateAllPromptAnalysis(
          scholarshipTitle,
          scholarshipDescription,
          promptText,
        )

        // Save all analysis data
        await Promise.all([
          savePromptHiddenCriteriaToDB(dbPrompt.id, analysis.hiddenCriteria),
          savePromptPersonalityToDB(dbPrompt.id, analysis.personality),
          savePromptPrioritiesToDB(dbPrompt.id, analysis.priorities),
          savePromptValuesToDB(dbPrompt.id, analysis.values),
          savePromptWeightsToDB(dbPrompt.id, analysis.weights),
        ])
      }),
    )
  } catch (error) {
    console.error('Error generating prompt analysis:', error)
    throw new Error(`Failed to generate analysis: ${(error as Error).message}`)
  }
}
