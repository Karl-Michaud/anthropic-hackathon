import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

interface GenerateEssayRequest {
  scholarshipTitle: string
  scholarshipDescription: string
  essayPrompt: string
  maxWordCount?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateEssayRequest = await request.json()
    const { scholarshipTitle, scholarshipDescription, essayPrompt, maxWordCount } = body

    if (!essayPrompt) {
      return NextResponse.json(
        { success: false, error: 'Essay prompt is required' },
        { status: 400 }
      )
    }

    const wordCountInstruction = maxWordCount
      ? `The essay must be approximately ${maxWordCount} words (do not exceed this limit).`
      : 'Write a comprehensive essay of appropriate length.'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are an expert scholarship essay writer. Write a compelling, authentic scholarship essay based on the following information:

Scholarship: ${scholarshipTitle}
Description: ${scholarshipDescription}
Essay Prompt: ${essayPrompt}

${wordCountInstruction}

Guidelines:
- Write in first person from the perspective of a student applicant
- Be specific and use concrete examples (you may create plausible fictional experiences)
- Show don't tell - demonstrate qualities through stories
- Address the prompt directly and completely
- Match the tone to the scholarship's values
- Include a strong opening hook and memorable conclusion

Write only the essay content, no additional commentary or meta-text.`,
        },
      ],
    })

    const essayContent =
      message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({
      success: true,
      data: { content: essayContent },
    })
  } catch (error) {
    console.error('Essay generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate essay',
      },
      { status: 500 }
    )
  }
}
