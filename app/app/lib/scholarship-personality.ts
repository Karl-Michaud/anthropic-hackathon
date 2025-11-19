import Anthropic from '@anthropic-ai/sdk'
import { IScholarshipPersonality } from '@/app/types/scholarship-personality'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getScholarshipPersonality(
  scholarshipTitle: string,
  scholarshipDescription: string,
  essayPrompt: string,
): Promise<IScholarshipPersonality> {
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

  let parsed: IScholarshipPersonality
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
  return `You are an expert in scholarship essay strategy and narrative psychology. 
Your task is to extract the “personality” and messaging strategy of a scholarship based on its description and essay prompt. 
This will be used to guide how a student's story is reframed for maximum alignment.

---

### SCHOLARSHIP INPUT
Title: ${scholarshipTitle}
Description: ${scholarshipDescription}
Essay Prompt: ${essayPrompt}

---

### TASK INSTRUCTIONS

Analyze the scholarship carefully and produce a **personality profile** that captures:
1. **Core Identity (Archetype):** What kind of student this scholarship truly rewards — e.g., Innovator, Scholar, Servant Leader, Visionary, Entrepreneur, Changemaker.
2. **Tone & Style Preference:** How essays should sound to appeal to this scholarship (formal, energetic, heartfelt, technical, visionary, etc.).
3. **Communication Strategy:** What storytelling approach works best — e.g., start with a failure, highlight measurable impact, show curiosity beyond grades.
4. **Values Emphasized:** List 4-6 values or traits the scholarship implicitly rewards (e.g., creativity, resilience, empathy, impact, leadership, academic excellence).
5. **Hidden Criteria:** Identify unspoken expectations or traits inferred from language (e.g., “Resilience through failure,” “Hands-on experimentation,” “Long-term commitment to service”).
6. **Recommended Essay Focus:** Describe how the essay should be reframed or structured to match this personality — what kind of story hook, tone, or emphasis to use.
7. **Contrast Examples:** Briefly explain how this personality differs from at least two other common scholarship types (e.g., “vs. Merit Academic” and “vs. Community Service”).

---

### OUTPUT FORMAT

Respond **only** in strict JSON format:

{
  "personality_profile": {
    "core_identity": "string",
    "tone_style": "string",
    "communication_strategy": "string",
    "values_emphasized": ["string", "string", ...],
    "hidden_criteria": ["string", "string", ...],
    "recommended_essay_focus": "string",
    "contrast_examples": {
      "vs_merit_academic": "string",
      "vs_service": "string"
    }
  }
}

Ensure the response is concise, factual, and inferential — no commentary or markdown, JSON only.`
}
