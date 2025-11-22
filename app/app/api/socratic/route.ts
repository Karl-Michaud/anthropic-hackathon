import Anthropic from '@anthropic-ai/sdk'
import {
  HighlightedSection,
  SocraticQuestion,
} from '@/app/context/WhiteboardContext'

const client = new Anthropic()

interface SocraticAnalysisRequest {
  essayContent: string
  scholarshipTitle?: string
}

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

export async function POST(request: Request) {
  try {
    const { essayContent, scholarshipTitle } =
      (await request.json()) as SocraticAnalysisRequest

    if (!essayContent || essayContent.trim().length === 0) {
      return Response.json(
        { error: 'Essay content is required' },
        { status: 400 },
      )
    }

    // Use Claude to analyze the essay and identify areas for elaboration
    const analysisPrompt = `You are an expert essay editor. Analyze the following essay and identify ${
      essayContent.length > 500 ? '3-5' : '2-3'
    } key sections that need elaboration or improvement.

For each section:
1. Identify the exact text span (word indices) that needs improvement
2. Provide a brief theme/title for that section
3. Generate 2-4 Socratic questions to help the student elaborate on this area

Essay:
${essayContent}

${scholarshipTitle ? `Scholarship: ${scholarshipTitle}` : ''}

Respond in JSON format:
{
  "sections": [
    {
      "startIndex": 0,
      "endIndex": 15,
      "title": "Theme of this section",
      "questions": [
        "Question 1?",
        "Question 2?"
      ]
    }
  ]
}

IMPORTANT:
- startIndex and endIndex are CHARACTER positions (not word positions)
- Ensure indices are accurate and don't overlap
- Questions should be open-ended and encourage deeper thinking
- Return ONLY valid JSON, no markdown formatting`

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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

    // Parse the JSON response
    let analysisData
    try {
      analysisData = JSON.parse(textContent.text)
    } catch (e) {
      console.error('Failed to parse Claude response:', textContent.text)
      throw new Error('Failed to parse analysis response')
    }

    // Convert analysis data to highlighted sections and Socratic questions
    const highlightedSections: HighlightedSection[] = []
    const socraticData: Record<string, SocraticQuestion[]> = {}

    const sections = analysisData.sections || []
    for (
      let i = 0;
      i < Math.min(sections.length, HIGHLIGHT_COLORS.length);
      i++
    ) {
      const section = sections[i]
      const colorName = HIGHLIGHT_COLORS[i]
      const sectionId = `section-${Date.now()}-${i}`

      // Create highlighted section
      highlightedSections.push({
        id: sectionId,
        startIndex: section.startIndex,
        endIndex: section.endIndex,
        color: colorName,
        title: section.title,
        colorName,
      })

      // Create Socratic questions for this section
      socraticData[sectionId] = (section.questions || []).map(
        (question: string, idx: number) => ({
          id: `question-${sectionId}-${idx}`,
          text: question,
          answer: '',
        }),
      )
    }

    return Response.json({
      highlightedSections,
      socraticData,
    } as SocraticAnalysisResponse)
  } catch (error) {
    console.error('Error analyzing essay for Socratic questions:', error)
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to analyze essay',
      },
      { status: 500 },
    )
  }
}
