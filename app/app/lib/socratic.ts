'use server'

import Anthropic from '@anthropic-ai/sdk'
import {
  HighlightedSection,
  SocraticQuestion,
} from '@/app/context/WhiteboardContext'
import { createClient as createServerClient } from '@/app/utils/supabase/server'
import { IUserProfile } from '@/app/types/user-profile'

const client = new Anthropic()

interface SocraticAnalysisResponse {
  highlightedSections: HighlightedSection[]
  socraticData: Record<string, SocraticQuestion[]>
}

const HIGHLIGHT_COLORS: Array<'amber' | 'cyan' | 'pink' | 'lime' | 'purple'> = [
  'amber',
  'cyan',
  'pink',
  'lime',
  'purple',
]

export async function analyzeSocratic(
  essayContent: string,
  scholarshipTitle?: string,
  userId?: string,
): Promise<SocraticAnalysisResponse> {
  console.log('🔍 [analyzeSocratic] CALLED')
  console.log('  - scholarshipTitle:', scholarshipTitle || 'NOT PROVIDED')
  console.log('  - essayContent type:', typeof essayContent)
  console.log('  - essayContent value:', essayContent ? `"${essayContent.substring(0, 100)}..."` : 'NULL/UNDEFINED')
  console.log('  - essayContent length:', essayContent?.length || 0)
  console.log('  - essayContent trimmed length:', essayContent?.trim().length || 0)

  if (!essayContent || essayContent.trim().length === 0) {
    console.error('❌ [analyzeSocratic] Essay content is empty!')
    console.error('  - essayContent:', essayContent)
    console.error('  - Stack trace will follow...')
    throw new Error('Essay content is required')
  }

  // Validate that essay is long enough for analysis
  const wordCount = essayContent.trim().split(/\s+/).length
  console.log('  - Word count:', wordCount)

  if (wordCount < 10) {
    console.warn('⚠️ [analyzeSocratic] Essay too short for analysis:', { wordCount })
    // Return empty result instead of error for very short essays
    return {
      highlightedSections: [],
      socraticData: {},
    }
  }

  // Fetch user profile if userId is provided
  let userProfile: IUserProfile | null = null
  if (userId) {
    try {
      const supabase = await createServerClient()
      const { data } = await supabase
        .from('whiteboard_data')
        .select('user_profile')
        .eq('user_id', userId)
        .single()

      if (data?.user_profile) {
        userProfile = data.user_profile as IUserProfile
        console.log('✅ User profile loaded for Socratic analysis:', {
          name: `${userProfile.firstName} ${userProfile.lastName}`,
        })
      }
    } catch (error) {
      console.warn('Could not load user profile for Socratic analysis:', error)
    }
  }

  // Build user context section
  const userContext = userProfile
    ? `

### APPLICANT PROFILE
Use this information to craft personalized questions that help the student elaborate on their actual experiences. Do NOT make up any details. Do not hallucinate information.

**Name**: ${userProfile.firstName} ${userProfile.lastName}

**Background Summary**:
${userProfile.userSummary}

**CV/Resume Highlights**:
${userProfile.cvResumeSummary}
`
    : ''

  // Use Claude to analyze the essay and identify areas for elaboration
  const sectionCount =
    essayContent.length > 500
      ? '3-5'
      : essayContent.length > 200
        ? '2-3'
        : '1-2'

  const analysisPrompt = `You are an expert essay editor analyzing a student essay${
    scholarshipTitle ? ` for the "${scholarshipTitle}" scholarship` : ''
  }.
${userContext}

Your task: Identify ${sectionCount} key sections that would benefit from elaboration or improvement.

For each section:
1. Find exact character start and end positions (0-indexed) of the text to improve
2. Create a brief title/theme for that section (3-5 words)
3. Generate 2-4 open-ended Socratic questions to guide elaboration

Essay to analyze:
"""
${essayContent}
"""

Respond with ONLY valid JSON (no markdown, no code blocks), matching this exact structure:
{
  "sections": [
    {
      "startIndex": 0,
      "endIndex": 50,
      "title": "Theme title here",
      "questions": ["Question 1?", "Question 2?"]
    }
  ]
}

Rules:
- startIndex and endIndex are CHARACTER positions, not word positions
- Ensure indices are valid and don't overlap
- Each question should encourage deeper thinking
- Return only the JSON object, nothing else`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
  })

  // Extract the text content from the response
  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  // Parse the JSON response - handle potential markdown formatting
  let analysisData
  let jsonText = textContent.text.trim()

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '')
  }

  try {
    analysisData = JSON.parse(jsonText)
  } catch (parseError) {
    console.error('Failed to parse Claude response:', {
      error: parseError,
      response: jsonText,
    })
    throw new Error(
      `Failed to parse analysis response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
    )
  }

  // Validate the parsed data has required fields
  if (!analysisData.sections || !Array.isArray(analysisData.sections)) {
    console.error('Invalid analysis data structure:', analysisData)
    throw new Error(
      'Invalid response structure: missing or invalid "sections" field',
    )
  }

  // Convert analysis data to highlighted sections and Socratic questions
  const highlightedSections: HighlightedSection[] = []
  const socraticData: Record<string, SocraticQuestion[]> = {}

  const sections = analysisData.sections || []
  for (let i = 0; i < Math.min(sections.length, HIGHLIGHT_COLORS.length); i++) {
    const section = sections[i]

    // Validate section data
    if (
      typeof section.startIndex !== 'number' ||
      typeof section.endIndex !== 'number' ||
      !section.title ||
      !Array.isArray(section.questions)
    ) {
      console.warn('Skipping invalid section:', section)
      continue
    }

    // Validate indices are within essay bounds
    if (
      section.startIndex < 0 ||
      section.endIndex > essayContent.length ||
      section.startIndex >= section.endIndex
    ) {
      console.warn('Section indices out of bounds:', {
        startIndex: section.startIndex,
        endIndex: section.endIndex,
        essayLength: essayContent.length,
      })
      continue
    }

    const colorName = HIGHLIGHT_COLORS[i]
    const sectionId = `section-${Date.now()}-${i}`

    // Create highlighted section
    highlightedSections.push({
      id: sectionId,
      startIndex: section.startIndex,
      endIndex: section.endIndex,
      color: colorName,
      title: section.title || 'Improvement area',
      colorName,
    })

    // Create Socratic questions for this section
    const validQuestions = section.questions.filter(
      (q: unknown) => typeof q === 'string' && q.trim().length > 0,
    )

    if (validQuestions.length > 0) {
      socraticData[sectionId] = validQuestions.map(
        (question: string, idx: number) => ({
          id: `question-${sectionId}-${idx}`,
          text: question,
          answer: '',
        }),
      )
    }
  }

  return {
    highlightedSections,
    socraticData,
  }
}

export async function submitSocraticAnswers(
  essayContent: string,
  answers: Record<string, string>,
  userId?: string,
): Promise<string> {
  if (!essayContent) {
    throw new Error('Essay content is required')
  }

  if (!answers) {
    throw new Error('Answers are required')
  }

  // Combine answers into a readable format
  const answersText = Object.values(answers)
    .filter((answer) => answer.trim().length > 0)
    .join('\n\n')

  if (!answersText) {
    throw new Error('No answers provided')
  }

  // Fetch user profile if userId is provided
  let userProfile: IUserProfile | null = null
  if (userId) {
    try {
      const supabase = await createServerClient()
      const { data } = await supabase
        .from('whiteboard_data')
        .select('user_profile')
        .eq('user_id', userId)
        .single()

      if (data?.user_profile) {
        userProfile = data.user_profile as IUserProfile
        console.log('✅ User profile loaded for Socratic submission:', {
          name: `${userProfile.firstName} ${userProfile.lastName}`,
        })
      }
    } catch (error) {
      console.warn('Could not load user profile for Socratic submission:', error)
    }
  }

  // Build user context section
  const userContext = userProfile
    ? `

### APPLICANT PROFILE
Use this to ensure improvements align with the student's actual background:

**Name**: ${userProfile.firstName} ${userProfile.lastName}

**Background Summary**:
${userProfile.userSummary}

**CV/Resume Highlights**:
${userProfile.cvResumeSummary}
`
    : ''

  // Use Claude to enhance the essay based on the student's responses
  const updatePrompt = `You are an expert essay editor. A student has provided the following elaborations to improve their essay.
${userContext}

Original Essay:
${essayContent}

Student's Elaborations:
${answersText}

Based on the student's responses, improve the essay by incorporating their insights and elaborations. Maintain the original structure and tone while enhancing the content with the details they provided. Make the writing flow naturally.

Return ONLY the improved essay text, no explanations or markdown.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: updatePrompt,
      },
    ],
  })

  // Extract the updated essay from the response
  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  return textContent.text.trim()
}
