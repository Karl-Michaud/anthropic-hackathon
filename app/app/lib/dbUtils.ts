'use server'

import { prisma } from './prisma'
import { generateAllPromptAnalysis } from './request'
import type {
  IPromptPersonality,
  IPromptPriority,
  IPromptValues,
  IPromptWeights,
} from '../types/interfaces'

export interface ScholarshipRecord {
  title: string
  description: string
  prompt: string
}

export async function saveScholarshipToDB(
  title: string,
  description: string,
  prompt: string,
) {
  try {
    const scholarship = await prisma.scholarship.create({
      data: {
        title,
        description,
        prompt,
      },
      include: {
        promptPersonality: true,
        promptPriority: true,
        promptValue: true,
        promptWeight: true,
        drafts: true,
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
        promptPriority: true,
        promptValue: true,
        promptWeight: true,
        drafts: true,
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
        promptPriority: true,
        promptValue: true,
        promptWeight: true,
        drafts: true,
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
        promptPriority: true,
        promptValue: true,
        promptWeight: true,
        drafts: true,
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
    const existingDraft = await prisma.draft.findUnique({
      where: {
        scholarshipId,
      },
    })

    if (existingDraft) {
      // Update existing draft
      await prisma.draft.update({
        where: { scholarshipId },
        data: { essay: content },
      })
    } else {
      // Create new draft
      await prisma.draft.create({
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
    const draft = await prisma.draft.findUnique({
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

export async function savepromptPriorityToDB(
  scholarshipId: string,
  data: IPromptPriority,
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
      'OTHER') as
      | 'MERIT'
      | 'COMMUNITY'
      | 'INNOVATION'
      | 'LEADERSHIP'
      | 'ACADEMIC_EXCELLENCE'
      | 'EQUITY'
      | 'OTHER'

    const existingPriorities = await prisma.promptPriority.findUnique({
      where: { scholarshipId },
    })

    if (existingPriorities) {
      await prisma.promptPriority.update({
        where: { scholarshipId },
        data: {
          primaryFocus: primaryFocusValue,
          priorityWeights: data.priority_weights,
        },
      })
    } else {
      await prisma.promptPriority.create({
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
    const existingValues = await prisma.promptValue.findUnique({
      where: { scholarshipId },
    })

    if (existingValues) {
      await prisma.promptValue.update({
        where: { scholarshipId },
        data: {
          valuesEmphasized: data.values_emphasized,
          valueDefinitions: data.value_definitions,
          evidencePhrases: data.evidence_phrases,
        },
      })
    } else {
      await prisma.promptValue.create({
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
    const existingWeights = await prisma.promptWeight.findUnique({
      where: { scholarshipId },
    })

    if (existingWeights) {
      await prisma.promptWeight.update({
        where: { scholarshipId },
        data: {
          weights: data, // store the whole weight structure
        },
      })
    } else {
      await prisma.promptWeight.create({
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
  prompt: string,
): Promise<void> {
  try {
    const analysis = await generateAllPromptAnalysis(
      scholarshipTitle,
      scholarshipDescription,
      prompt,
    )

    // Save all analysis data
    await Promise.all([
      savePromptPersonalityToDB(scholarshipId, analysis.personality),
      savepromptPriorityToDB(scholarshipId, analysis.priorities),
      savePromptValuesToDB(scholarshipId, analysis.values),
      savePromptWeightsToDB(scholarshipId, analysis.weights),
    ])
  } catch (error) {
    console.error('Error generating prompt analysis:', error)
    throw new Error(`Failed to generate analysis: ${(error as Error).message}`)
  }
}

// Whiteboard Data functions
export interface WhiteboardData {
  cells: Record<string, unknown> | unknown[]
  scholarships: Record<string, unknown> | unknown[]
  essays: Record<string, unknown> | unknown[]
  jsonOutputs: Record<string, unknown> | unknown[]
  blockPositions: Record<string, unknown> | unknown[]
}

export interface WhiteboardDatabaseRow {
  id: string
  userId: string
  cells: unknown[]
  scholarships: unknown[]
  essays: unknown[]
  jsonOutputs: unknown[]
  blockPositions: unknown[]
  isFirstTimeUser: boolean
}

/**
 * Get whiteboard data for a user
 * Returns null if no data exists yet
 */
export async function getWhiteboardData(
  userId: string,
): Promise<WhiteboardDatabaseRow | null> {
  try {
    const data = await prisma.whiteboardData.findUnique({
      where: { userId },
    })

    if (!data) {
      return null
    }

    return {
      id: data.id,
      userId: data.userId,
      cells: Array.isArray(data.cells) ? data.cells : [],
      scholarships: Array.isArray(data.scholarships) ? data.scholarships : [],
      essays: Array.isArray(data.essays) ? data.essays : [],
      jsonOutputs: Array.isArray(data.jsonOutputs) ? data.jsonOutputs : [],
      blockPositions: Array.isArray(data.blockPositions)
        ? data.blockPositions
        : [],
      isFirstTimeUser: data.isFirstTimeUser,
    }
  } catch (error) {
    console.error('Error fetching whiteboard data:', error)
    throw error
  }
}

/**
 * Save whiteboard data for a user
 * Creates new row if doesn't exist, updates if it does
 */
export async function saveWhiteboardData(
  userId: string,
  whiteboardData: WhiteboardData,
): Promise<void> {
  try {
    console.log('Attempting to save data for user:', userId)
    console.log('Whiteboard data:', {
      cellsCount: whiteboardData.cells.length,
      scholarshipsCount: whiteboardData.scholarships.length,
      essaysCount: whiteboardData.essays.length,
    })

    // Prisma's strict JSON typing requires 'any' for flexible JSON data structures
    await prisma.whiteboardData.upsert({
      where: { userId },
      update: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cells: whiteboardData.cells as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scholarships: whiteboardData.scholarships as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        essays: whiteboardData.essays as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonOutputs: whiteboardData.jsonOutputs as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        blockPositions: whiteboardData.blockPositions as any,
      },
      create: {
        userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cells: whiteboardData.cells as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scholarships: whiteboardData.scholarships as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        essays: whiteboardData.essays as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonOutputs: whiteboardData.jsonOutputs as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        blockPositions: whiteboardData.blockPositions as any,
      },
    })

    console.log('Successfully saved whiteboard data for user:', userId)
  } catch (error) {
    console.error('Error saving whiteboard data:', error)
    throw new Error(
      `Failed to save whiteboard data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Mark user as returning (no longer first-time user)
 */
export async function markUserAsReturning(userId: string): Promise<void> {
  try {
    await prisma.whiteboardData.update({
      where: { userId },
      data: { isFirstTimeUser: false },
    })
  } catch (error) {
    console.error('Error marking user as returning:', error)
    // Don't throw - this is not critical
  }
}
