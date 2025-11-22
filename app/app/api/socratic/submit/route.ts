import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface SubmitSocraticAnswersRequest {
  essayContent: string
  sectionId: string
  answers: Record<string, string>
}

interface SubmitSocraticAnswersResponse {
  updatedEssay: string
}

export async function POST(request: Request) {
  try {
    const { essayContent, sectionId, answers } =
      (await request.json()) as SubmitSocraticAnswersRequest

    if (!essayContent || !sectionId || !answers) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // Combine answers into a readable format
    const answersText = Object.values(answers)
      .filter((answer) => answer.trim().length > 0)
      .join('\n\n')

    if (!answersText) {
      return Response.json({ error: 'No answers provided' }, { status: 400 })
    }

    // Use Claude to enhance the essay based on the student's responses
    const updatePrompt = `You are an expert essay editor. A student has provided the following elaborations to improve their essay.

Original Essay:
${essayContent}

Student's Elaborations:
${answersText}

Based on the student's responses, improve the essay by incorporating their insights and elaborations. Maintain the original structure and tone while enhancing the content with the details they provided. Make the writing flow naturally.

Return ONLY the improved essay text, no explanations or markdown.`

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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

    return Response.json({
      updatedEssay: textContent.text,
    } as SubmitSocraticAnswersResponse)
  } catch (error) {
    console.error('Error submitting Socratic answers:', error)
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process answers',
      },
      { status: 500 },
    )
  }
}
