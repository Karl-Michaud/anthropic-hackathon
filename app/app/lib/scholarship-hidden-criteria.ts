import Anthropic from '@anthropic-ai/sdk'
import { IScholarshipHiddenCriteria } from '@/app/types/scholarship-hidden-criteria'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getScholarshipHiddenCriteria(
  scholarshipTitle: string,
  scholarshipDescription: string,
  essayPrompt: string,
): Promise<IScholarshipHiddenCriteria> {
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

  let parsed: IScholarshipHiddenCriteria
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
  return `You are an expert in linguistic inference and selection pattern recognition.
Your job is to detect **hidden criteria**—traits or preferences not explicitly stated in the scholarship description.

---

SCHOLARSHIP INPUT:
Title: ${scholarshipTitle}
Description: ${scholarshipDescription}
Essay Prompt: ${essayPrompt}

---

TASK:
Infer what qualities this scholarship secretly values, based on tone, emphasis, and phrasing.
Explain the rationale briefly and provide text evidence.

Return JSON only:

{
  "implicit_criteria": [
    {
      "trait": "Resilience through failure",
      "rationale": "Mentions of 'overcoming obstacles' and 'learning experiences'.",
      "evidence_phrases": ["'adversity'", "'growth mindset'"],
      "importance": "high"
    }
  ],
  "overall_pattern": "Prefers applicants who grow from challenges and show perseverance.",
  "summary": "Strong hidden bias toward resilience and learning from hardship.",
  "confidence_score": 87
}`
}
