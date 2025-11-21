// TODO: implement usage of previous contexts (like values and priorities)

import Anthropic from '@anthropic-ai/sdk'
import {
  IPromptHiddenCriteria,
  IPromptPersonality,
  IPromptPriorities,
  IPromptValues,
  IGenerateDraft,
} from '@/app/types/interfaces'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export type ClaudeRequestType =
  | 'promptHiddenCriteria'
  | 'promptPersonality'
  | 'promptPriorities'
  | 'promptValues'
  | 'generateDraft'

export type ClaudeResponse =
  | IPromptHiddenCriteria
  | IPromptPersonality
  | IPromptPriorities
  | IPromptValues
  | IGenerateDraft

export async function requestClaude<T extends ClaudeResponse>(
  type: ClaudeRequestType,
  scholarshipTitle: string,
  scholarshipDescription: string,
  essayPrompt: string,
): Promise<T> {
  const llmPrompt = getPromptForType(
    type,
    scholarshipTitle,
    scholarshipDescription,
    essayPrompt,
  )

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: llmPrompt }],
  })

  const responseText = (message.content[0] as Anthropic.TextBlock).text

  try {
    return JSON.parse(responseText) as T
  } catch (error) {
    console.error('Failed to parse Claude response:', error)
    console.error('Raw response:', responseText)
    throw new Error(`Claude response did not match expected format for ${type}`)
  }
}

// ###########
// # PROMPTS #
// ###########

function generateHiddenCriteriaPrompt(
  title: string,
  desc: string,
  prompt: string,
): string {
  return `You are an expert in linguistic inference and selection pattern recognition.
Your job is to detect **hidden criteria**—traits or preferences not explicitly stated in the scholarship description.

---

SCHOLARSHIP INPUT:
Title: ${title}
Description: ${desc}
Essay Prompt: ${prompt}

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

function generatePersonalityPrompt(
  title: string,
  desc: string,
  prompt: string,
): string {
  return `You are an expert in scholarship essay strategy and narrative psychology. 
Your task is to extract the “personality” and messaging strategy of a scholarship based on its description and essay prompt. 
This will be used to guide how a student's story is reframed for maximum alignment.

---

### SCHOLARSHIP INPUT
Title: ${title}
Description: ${desc}
Essay Prompt: ${prompt}

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

function generatePrioritiesPrompt(
  title: string,
  desc: string,
  prompt: string,
): string {
  return `Analyze this scholarship's **selection priorities**—what it rewards and values most when selecting recipients.

---

SCHOLARSHIP INPUT:
Title: ${title}
Description: ${desc}
Essay Prompt: ${prompt}

---

TASK:
Identify the scholarship's primary focus (merit, innovation, leadership, etc.), estimate relative weights, and describe the kind of student who best matches it. Highlight language that signals those priorities.

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

function generateValuesPrompt(
  title: string,
  desc: string,
  prompt: string,
): string {
  return `You are an expert in pattern recognition for scholarship analysis.
Given the following scholarship description and essay prompt, identify what **values** this scholarship most emphasizes.

---

SCHOLARSHIP INPUT:
Title: ${title}
Description: ${desc}
Essay Prompt: ${prompt}

---

TASK:
List the top values this scholarship rewards (e.g., creativity, integrity, perseverance, impact, leadership).  
Define each value in this scholarship's context and include brief supporting language evidence.

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

function generateDraftPrompt(
  title: string,
  desc: string,
  prompt: string,
): string {
  return `Analyze this scholarship's **selection priorities**—what it rewards and values most when selecting recipients.

---

SCHOLARSHIP INPUT:
Title: ${title}
Description: ${desc}
Essay Prompt: ${prompt}

---

TASK:
Based on the information above, write a draft essay in response to the prompt to the very best of your abilities.

Return JSON only:

{
  "essay": "the essay goes here",
}`
}

function getPromptForType(
  type: ClaudeRequestType,
  scholarshipTitle: string,
  scholarshipDescription: string,
  prompt: string,
): string {
  switch (type) {
    case 'promptHiddenCriteria':
      return generateHiddenCriteriaPrompt(
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      )
    case 'promptPersonality':
      return generatePersonalityPrompt(
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      )
    case 'promptPriorities':
      return generatePrioritiesPrompt(
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      )
    case 'promptValues':
      return generateValuesPrompt(
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      )
    case 'generateDraft':
      return generateDraftPrompt(
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      )
    default:
      throw new Error(`Unsupported Claude request type: ${type}`)
  }
}
