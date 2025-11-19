import Anthropic from '@anthropic-ai/sdk'
import { IScholarshipPriorities } from '@/app/types/scholarship-priorities'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getScholarshipPriorities(
  scholarshipTitle: string,
  scholarshipDescription: string,
  essayPrompt: string,
): Promise<IScholarshipPriorities> {
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

  let parsed: IScholarshipPriorities
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
  return `Analyze this scholarship’s **selection priorities**—what it rewards and values most when selecting recipients.

---

SCHOLARSHIP INPUT:
Title: ${scholarshipTitle}
Description: ${scholarshipDescription}
Essay Prompt: ${essayPrompt}

---

TASK:
Identify the scholarship’s primary focus (merit, innovation, leadership, etc.), estimate relative weights, and describe the kind of student who best matches it. Highlight language that signals those priorities.

Return JSON only:

{
  "primary_focus": "innovation",
  "priority_weights": {
    "innovation": 40,
    "leadership": 30,
    "community": 20,
    "academic_excellence": 10
  },
  "selection_signals": ["'innovative thinking'", "'real-world impact'"],
  "success_profile": "Inventive, hands-on student who builds solutions.",
  "summary": "Prioritizes innovation and leadership with applied outcomes.",
  "confidence_score": 88
}`
}
