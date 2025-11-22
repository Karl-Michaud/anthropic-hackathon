'use server'

import { prisma } from './prisma'

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
