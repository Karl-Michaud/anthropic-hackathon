'use server'

import { prisma } from './prisma'
import { generateAllPromptAnalysis } from './request'
import type {
  IPromptPersonality,
  IPromptPriorities,
  IPromptValues,
  IPromptWeights,
} from '../types/interfaces'

export interface ScholarshipRecord {
  id: string
  title: string
  description: string
  prompt: string
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
        prompt: prompts[0] || '',
      },
      include: {
        promptPersonality: true,
        promptPriorities: true,
        promptValues: true,
        promptWeights: true,
        generateDraft: true,
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
        promptPersonality: true,
        promptPriorities: true,
        promptValues: true,
        promptWeights: true,
        generateDraft: true,
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
        promptPersonality: true,
        promptPriorities: true,
        promptValues: true,
        promptWeights: true,
        generateDraft: true,
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
        promptPersonality: true,
        promptPriorities: true,
        promptValues: true,
        promptWeights: true,
        generateDraft: true,
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
  content: string,
): Promise<void> {
  try {
    // Verify scholarship exists
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    })

    if (!scholarship) {
      console.warn(
        `Scholarship ${scholarshipId} not found in database. Skipping draft save.`,
      )
      return
    }

    // Check if draft exists for this scholarship
    const existingDraft = await prisma.generateDraft.findUnique({
      where: {
        scholarshipId,
      },
    })

    if (existingDraft) {
      // Update existing draft
      await prisma.generateDraft.update({
        where: { scholarshipId },
        data: { essay: content },
      })
    } else {
      // Create new draft
      await prisma.generateDraft.create({
        data: {
          essay: content,
          scholarshipId,
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
): Promise<string | null> {
  try {
    const draft = await prisma.generateDraft.findUnique({
      where: {
        scholarshipId,
      },
    })

    return draft?.essay || null
  } catch (error) {
    console.error('Error fetching essay draft:', error)
    return null
  }
}

export async function savePromptPersonalityToDB(
  scholarshipId: string,
  data: IPromptPersonality,
): Promise<void> {
  try {
    const profile = data.personality_profile

    const existingPersonality = await prisma.promptPersonality.findUnique({
      where: { scholarshipId },
    })

    if (existingPersonality) {
      await prisma.promptPersonality.update({
        where: { scholarshipId },
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
          scholarshipId,
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
  scholarshipId: string,
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
      'OTHER') as unknown

    const existingPriorities = await prisma.promptPriorities.findUnique({
      where: { scholarshipId },
    })

    if (existingPriorities) {
      await prisma.promptPriorities.update({
        where: { scholarshipId },
        data: {
          primaryFocus: primaryFocusValue,
          priorityWeights: data.priority_weights,
        },
      })
    } else {
      await prisma.promptPriorities.create({
        data: {
          scholarshipId,
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
  scholarshipId: string,
  data: IPromptValues,
): Promise<void> {
  try {
    const existingValues = await prisma.promptValues.findUnique({
      where: { scholarshipId },
    })

    if (existingValues) {
      await prisma.promptValues.update({
        where: { scholarshipId },
        data: {
          valuesEmphasized: data.values_emphasized,
          valueDefinitions: data.value_definitions,
          evidencePhrases: data.evidence_phrases,
        },
      })
    } else {
      await prisma.promptValues.create({
        data: {
          scholarshipId,
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
  scholarshipId: string,
  data: IPromptWeights,
): Promise<void> {
  try {
    const existingWeights = await prisma.promptWeights.findUnique({
      where: { scholarshipId },
    })

    if (existingWeights) {
      await prisma.promptWeights.update({
        where: { scholarshipId },
        data: {
          weights: data, // store the whole weight structure
        },
      })
    } else {
      await prisma.promptWeights.create({
        data: {
          scholarshipId,
          weights: data,
        },
      })
    }
  } catch (error) {
    console.error('Error saving weights:', error)
    throw new Error(`Failed to save weights: ${(error as Error).message}`)
  }
}

export async function generateAndSavePromptAnalysis(
  scholarshipId: string,
  scholarshipTitle: string,
  scholarshipDescription: string,
  prompts: string[],
): Promise<void> {
  try {
    const promptText = prompts[0] || ''

    const analysis = await generateAllPromptAnalysis(
      scholarshipTitle,
      scholarshipDescription,
      promptText,
    )

    // Save all analysis data
    await Promise.all([
      savePromptPersonalityToDB(scholarshipId, analysis.personality),
      savePromptPrioritiesToDB(scholarshipId, analysis.priorities),
      savePromptValuesToDB(scholarshipId, analysis.values),
      savePromptWeightsToDB(scholarshipId, analysis.weights),
    ])
  } catch (error) {
    console.error('Error generating prompt analysis:', error)
    throw new Error(`Failed to generate analysis: ${(error as Error).message}`)
  }
}
