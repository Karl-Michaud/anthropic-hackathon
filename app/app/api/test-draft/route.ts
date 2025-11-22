import { NextRequest, NextResponse } from 'next/server'
import {
  saveScholarshipToDB,
  generateAndSavePromptAnalysis,
  getScholarshipFromDB,
} from '@/app/lib/dbUtils'
import { generateDraftWithAnalysis } from '@/app/lib/request'

export async function POST(request: NextRequest) {
  try {
    const { title, description, prompt } = await request.json()

    if (!title || !description || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, prompt' },
        { status: 400 },
      )
    }

    // Step 1: Save scholarship to database
    const scholarship = await saveScholarshipToDB(title, description, [prompt])

    // Step 2: Generate and save all analysis data (personality, priorities, values, weights)
    await generateAndSavePromptAnalysis(scholarship.id, title, description, [
      prompt,
    ])

    // Step 3: Generate draft with analysis data from database
    const result = await generateDraftWithAnalysis(scholarship.id)

    // Step 4: Retrieve the saved analysis data to return to the client
    const scholarshipWithAnalysis = await getScholarshipFromDB(scholarship.id)

    return NextResponse.json({
      essay: result.essay,
      scholarshipId: scholarship.id,
      analysis: {
        personality: scholarshipWithAnalysis?.promptPersonality || null,
        priorities: scholarshipWithAnalysis?.promptPriorities || null,
        values: scholarshipWithAnalysis?.promptValues || null,
        weights: scholarshipWithAnalysis?.promptWeights || null,
      },
    })
  } catch (error) {
    console.error('Error generating draft:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    )
  }
}
