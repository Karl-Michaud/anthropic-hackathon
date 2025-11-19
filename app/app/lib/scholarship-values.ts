import Anthropic from '@anthropic-ai/sdk'
import { IScholarshipValues } from '@/app/types/scholarship-values'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getScholarshipValues(
  scholarshipTitle: string,
  scholarshipDescription: string,
  essayPrompt: string,
): Promise<IScholarshipValues> {
  const prompt = generatePrompt(
    scholarshipTitle,
    scholarshipDescription,
    essayPrompt,
  )

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = (message.content[0] as Anthropic.TextBlock).text

  let parsed: IScholarshipValues
  try {
    parsed = JSON.parse(responseText)
  } catch (e) {
    console.error(e)
    throw new Error()
  }

  return parsed
}

function generatePrompt(
  scholarshipTitle: string,
  scholarshipDescription: string,
  essayPrompt: string,
): string {
  return `You are an expert in pattern recognition for scholarship analysis.
Given the following scholarship description and essay prompt, identify what **values** this scholarship most emphasizes.

---

SCHOLARSHIP INPUT:
Title: ${scholarshipTitle}
Description: ${scholarshipDescription}
Essay Prompt: ${essayPrompt}

---

TASK:
List the top values this scholarship rewards (e.g., creativity, integrity, perseverance, impact, leadership).  
Define each value in this scholarship’s context and include brief supporting language evidence.

Return results in **strict JSON format** matching this schema:

{
  "values_emphasized": ["innovation", "resilience"],
  "value_definitions": {
    "innovation": "Encourages creative thinking and problem-solving.",
    "resilience": "Rewards persistence through challenges."
  },
  "evidence_phrases": ["'break new ground'", "'overcome adversity'"],
  "summary": "The scholarship values innovation and resilience above all.",
  "confidence_score": 92
}`
}
