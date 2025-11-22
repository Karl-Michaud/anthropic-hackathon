'use server'

import Anthropic from '@anthropic-ai/sdk'
import {
  FeedbackSection,
  FeedbackData,
} from '@/app/components/DynamicFeedback/types'
import { generateFeedbackId } from '@/app/components/DynamicFeedback'

const client = new Anthropic()

interface AnalyzeFeedbackRequest {
  essayContent: string
  scholarshipTitle?: string
  essayId: string
  scholarshipId: string
}

export async function analyzeFeedback(
  request: AnalyzeFeedbackRequest,
): Promise<FeedbackData> {
  const { essayContent, scholarshipTitle, essayId, scholarshipId } = request

  if (!essayContent || essayContent.trim().length === 0) {
    throw new Error('Essay content is required')
  }

  // Validate minimum essay length
  const wordCount = essayContent.trim().split(/\s+/).length
  if (wordCount < 20) {
    throw new Error('Essay is too short (minimum 20 words)')
  }

  // Use Claude to analyze the essay and generate feedback
  const analysisPrompt = `You are an expert college admission counselor analyzing a scholarship essay${
    scholarshipTitle ? ` for the "${scholarshipTitle}" scholarship` : ''
  }.

Your task: Identify 2-3 areas where the essay can be significantly improved. For each area, provide:
1. A clear title for the improvement area (e.g., "Strengthen Leadership Examples")
2. A brief description of what needs improvement
3. 2-3 thought-provoking questions to help the student elaborate

Focus on:
- Adding more specific examples and concrete details
- Clarifying motivations and deeper personal insights
- Demonstrating impact and measurable outcomes
- Making stronger connections to values and goals

Essay to analyze:
"""
${essayContent}
"""

Respond with ONLY valid JSON (no markdown, no code blocks), matching this exact structure:
{
  "sections": [
    {
      "title": "Area for Improvement",
      "description": "Why this area needs improvement",
      "questions": [
        "Question 1 to guide reflection?",
        "Question 2 to guide reflection?"
      ]
    }
  ]
}

Return 2-3 sections based on the essay quality and length.`

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

  // Extract and parse the response
  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

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

  // Validate response structure
  if (!analysisData.sections || !Array.isArray(analysisData.sections)) {
    console.error('Invalid analysis data structure:', analysisData)
    throw new Error(
      'Invalid response structure: missing or invalid "sections" field',
    )
  }

  // Convert analysis data to FeedbackSections
  const sections: FeedbackSection[] = analysisData.sections.map(
    (section: unknown, index: number) => {
      // Type assert section to have the expected structure
      const sectionData = section as Record<string, unknown>
      // Validate section data
      const title = (sectionData.title as string) || `Improvement Area ${index + 1}`
      const description = (sectionData.description as string) || ''
      const rawQuestions = (sectionData.questions as unknown[]) || []

      // Convert questions to Question objects
      const questions = (rawQuestions as unknown[])
        .filter((q: unknown) => typeof q === 'string' && q.trim().length > 0)
        .map((text: unknown, qIndex: number) => ({
          id: `q-${index}-${qIndex}`,
          text: text as string,
          answer: '',
          placeholder: 'Share your thoughts and insights...',
        }))

      return {
        id: `section-${index}`,
        title,
        description,
        questions,
        isComplete: false,
      }
    },
  )

  const feedbackData: FeedbackData = {
    id: generateFeedbackId(),
    essayId,
    scholarshipId,
    problemTitle: `Essay Enhancement Feedback${scholarshipTitle ? ` - ${scholarshipTitle}` : ''}`,
    sections,
    createdAt: Date.now(),
  }

  return feedbackData
}

export async function submitFeedback(
  essayContent: string,
  feedbackData: FeedbackData,
): Promise<string> {
  if (!essayContent || essayContent.trim().length === 0) {
    throw new Error('Essay content is required')
  }

  if (!feedbackData || !feedbackData.sections) {
    throw new Error('Feedback data is required')
  }

  // Format the feedback for the prompt
  const feedbackSummary = feedbackData.sections
    .map((section) => {
      const answers = section.questions.map((q) => `- ${q.answer}`).join('\n')
      return `\n**${section.title}**\nFeedback: ${section.description}\n\nStudent's Response:\n${answers}`
    })
    .join('\n')

  // Use Claude to enhance the essay based on the feedback
  const updatePrompt = `You are an expert essay editor helping a student improve their scholarship essay based on feedback received.

Original Essay:
"""
${essayContent}
"""

Feedback for Improvement:
${feedbackSummary}

Your task: Enhance the original essay by:
1. Incorporating the student's new insights and details from their responses
2. Expanding weak areas with more concrete examples and depth
3. Maintaining the original voice and structure
4. Adding more specific details and measurable outcomes where appropriate
5. Creating stronger connections between ideas
6. Improving clarity and flow

Guidelines:
- Preserve the original tone and personal voice
- Don't change the essay structure dramatically
- Integrate new information naturally
- Add 10-20% more content where needed for clarity
- Make the essay more compelling and specific

Return ONLY the improved essay text, no explanations or markdown formatting.`

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

  const updatedEssay = textContent.text.trim()

  if (updatedEssay.length < essayContent.length * 0.5) {
    throw new Error(
      'Generated essay is too short - Claude may not have properly understood the request',
    )
  }

  return updatedEssay
}
