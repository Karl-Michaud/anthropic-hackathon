'use server'

import Anthropic from '@anthropic-ai/sdk'
import {
  IPromptPersonality,
  IPromptPriorities,
  IPromptValues,
  IPromptWeights,
  IGenerateDraft,
} from '@/app/types/interfaces'
import { prisma } from './prisma'

// Interface for analysis data used in draft generation
export interface IDraftAnalysisData {
  personality?: {
    spirit: string
    toneStyle: string
    valuesEmphasized: string[]
    recommendedEssayFocus: string
  }
  priorities?: {
    primaryFocus: string
    priorityWeights: Record<string, number>
  }
  values?: {
    valuesEmphasized: string[]
    valueDefinitions: Record<string, string>
    evidencePhrases: string[]
  }
  weights?: Record<string, {
    weight: number
    subweights: Record<string, number>
  }>
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export type ClaudeRequestType =
  | 'promptPersonality'
  | 'promptPriorities'
  | 'promptValues'
  | 'promptWeights'
  | 'generateDraft'

export type ClaudeResponse =
  | IPromptPersonality
  | IPromptPriorities
  | IPromptValues
  | IPromptWeights
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
    // Strip markdown code blocks if present
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7) // Remove ```json
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3) // Remove ```
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3) // Remove trailing ```
    }
    jsonText = jsonText.trim()

    return JSON.parse(jsonText) as T
  } catch (error) {
    throw new Error(
      `Claude response did not match expected format for ${type}: ${error}`,
    )
  }
}

// ###########
// # PROMPTS #
// ###########

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

CRITICAL: Return ONLY valid JSON. Do NOT use markdown code blocks. Do NOT add explanatory text.

Analyze the scholarship carefully and produce a **personality profile** that captures:
1. **Core Identity (Archetype):** What kind of student this scholarship truly rewards — e.g., Innovator, Scholar, Servant Leader, Visionary, Entrepreneur, Changemaker.
2. **Tone & Style Preference:** How essays should sound to appeal to this scholarship (formal, energetic, heartfelt, technical, visionary, etc.).
3. **Communication Strategy:** What storytelling approach works best — e.g., start with a failure, highlight measurable impact, show curiosity beyond grades.
4. **Values Emphasized:** List 4-6 values or traits the scholarship implicitly rewards (e.g., creativity, resilience, empathy, impact, leadership, academic excellence).
5. **Recommended Essay Focus:** Describe how the essay should be reframed or structured to match this personality — what kind of story hook, tone, or emphasis to use.
6. **Contrast Examples:** Briefly explain how this personality differs from at least two other common scholarship types (e.g., “vs. Merit Academic” and “vs. Community Service”).

---

### OUTPUT FORMAT

Respond **only** in strict JSON format:

{
  "personality_profile": {
    "core_identity": "string",
    "tone_style": "string",
    "communication_strategy": "string",
    "values_emphasized": ["string", "string", ...],
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

CRITICAL: Return ONLY valid JSON. Do NOT use markdown code blocks. Do NOT add explanatory text.

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

CRITICAL: Return ONLY valid JSON. Do NOT use markdown code blocks. Do NOT add explanatory text.

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

function generateWeightsPrompt(
  title: string,
  description: string,
  prompt: string,
): string {
  return `You are an expert scholarship analysis system that identifies hidden criteria and assigns weights based on what scholarship committees truly value.

SCHOLARSHIP INFORMATION:
Name: ${title}
Description: ${description}
Essay Prompt: ${prompt}

ANALYSIS TASK:
Analyze the scholarship description and essay prompt to determine the hidden weight criteria. Assign weights to 10 primary categories and their subcategories based on signals in the text.

PRIMARY CATEGORIES (weights must sum to 1.0):

1. **Sustained Depth Over Resume Padding** - Look for signals valuing long-term commitment, progression, depth over breadth
   - Multi-year commitment: 3+ years in primary activities - highest differentiator
   - Progressive responsibility: Evolution from participant to leader/founder
   - Consistency of theme: Thematic coherence across activities

2. **Values-Driven Decision Making** - Look for signals valuing motivation, character, authenticity
   - Why over what: Motivation for choices equally weighted with character
   - Character under pressure: How you respond when tested
   - Authentic alignment: Natural fit with scholarship values

3. **Problem-Solving Orientation** - Look for signals valuing problem identification, solutions, outcomes
   - Problem identification: Seeing specific gaps/failures
   - Solution creation: Developing new approaches
   - Measurable outcomes: Quantified impact

4. **Entrepreneurial vs. Theoretical Mindset** - Look for signals valuing creation, innovation, real-world application
   - Commercial/social viability: Real-world application potential
   - Creation evidence: Founded, developed, launched
   - Innovation iteration: Multiple design attempts

5. **Future Investment Potential** - Look for signals valuing future contribution, scalability, knowledge sharing
   - Canadian contribution: Commitment to Canadian society/economy
   - Scalable impact vision: Solutions that can grow
   - Knowledge translation: Teaching/mentoring plans

6. **Adversity Plus Agency** - Look for signals valuing resilience, active response to challenges
   - Service despite struggle: Maintaining humanitarian commitment - dominant
   - Active response: What you did, not what happened
   - Challenge specificity: Concrete obstacles faced

7. **Interview Performance** - Look for signals indicating multi-stage selection, character assessment
   - Multi-stage assessment: Character through extended interaction
   - Values articulation: Equal weight with assessment
   - Pressure testing: Maintaining authenticity under stress

8. **Language Mirroring & Framing** - Look for specific terminology that should be echoed
   - Scholarship-specific language: Using their exact terminology
   - Story selection: Leading with aligned experiences
   - Authentic positioning: Same facts, different emphasis

9. **Regional & Nomination Strategy** - Look for geographic preferences, nomination requirements
   - Geographic advantage: Regional preferences
   - School nomination: Nomination bottleneck
   - Regional narrative: Local community connection

10. **Academic Threshold Sufficiency** - Look for academic requirements and intellectual signals
    - Intellectual curiosity: Self-directed learning most important
    - Applied knowledge: Using academics to solve problems
    - Meeting minimums: Academic thresholds

WEIGHTING RULES:
1. Primary category weights MUST sum to exactly 1.0
2. Subcategory weights within each category MUST sum to exactly 1.0
3. Assign higher weights to categories with strong signals in the description/prompt
4. Assign lower weights to categories with weak or no signals
5. Consider both explicit and implicit signals

RESPONSE FORMAT:
Return ONLY valid JSON in this exact structure:

{
  "Sustained Depth Over Resume Padding": {
    "weight": 0.10,
    "subweights": {
      "Multi-year commitment": 0.40,
      "Progressive responsibility": 0.30,
      "Consistency of theme": 0.30
    }
  },
  "Values-Driven Decision Making": {
    "weight": 0.10,
    "subweights": {
      "Why over what": 0.34,
      "Character under pressure": 0.33,
      "Authentic alignment": 0.33
    }
  },
  "Problem-Solving Orientation": {
    "weight": 0.10,
    "subweights": {
      "Problem identification": 0.34,
      "Solution creation": 0.33,
      "Measurable outcomes": 0.33
    }
  },
  "Entrepreneurial vs. Theoretical Mindset": {
    "weight": 0.10,
    "subweights": {
      "Commercial/social viability": 0.34,
      "Creation evidence": 0.33,
      "Innovation iteration": 0.33
    }
  },
  "Future Investment Potential": {
    "weight": 0.10,
    "subweights": {
      "Canadian contribution": 0.34,
      "Scalable impact vision": 0.33,
      "Knowledge translation": 0.33
    }
  },
  "Adversity Plus Agency": {
    "weight": 0.10,
    "subweights": {
      "Service despite struggle": 0.34,
      "Active response": 0.33,
      "Challenge specificity": 0.33
    }
  },
  "Interview Performance": {
    "weight": 0.10,
    "subweights": {
      "Multi-stage assessment": 0.34,
      "Values articulation": 0.33,
      "Pressure testing": 0.33
    }
  },
  "Language Mirroring & Framing": {
    "weight": 0.10,
    "subweights": {
      "Scholarship-specific language": 0.34,
      "Story selection": 0.33,
      "Authentic positioning": 0.33
    }
  },
  "Regional & Nomination Strategy": {
    "weight": 0.05,
    "subweights": {
      "Geographic advantage": 0.34,
      "School nomination": 0.33,
      "Regional narrative": 0.33
    }
  },
  "Academic Threshold Sufficiency": {
    "weight": 0.05,
    "subweights": {
      "Intellectual curiosity": 0.40,
      "Applied knowledge": 0.35,
      "Meeting minimums": 0.25
    }
  }
}

Analyze the scholarship and return ONLY the JSON with your calculated weights.`
}

function generateDraftPrompt(
  title: string,
  desc: string,
  prompt: string,
  analysisData?: IDraftAnalysisData,
): string {
  // Build analysis sections if data is available
  let analysisSection = ''

  if (analysisData) {
    if (analysisData.personality) {
      analysisSection += `
### SCHOLARSHIP PERSONALITY PROFILE
- **Core Identity/Spirit**: ${analysisData.personality.spirit}
- **Tone & Style**: ${analysisData.personality.toneStyle}
- **Values Emphasized**: ${analysisData.personality.valuesEmphasized.join(', ')}
- **Recommended Essay Focus**: ${analysisData.personality.recommendedEssayFocus}
`
    }

    if (analysisData.priorities) {
      const weightsStr = Object.entries(analysisData.priorities.priorityWeights)
        .map(([key, value]) => `  - ${key}: ${value}%`)
        .join('\n')
      analysisSection += `
### SCHOLARSHIP PRIORITIES
- **Primary Focus**: ${analysisData.priorities.primaryFocus}
- **Priority Weights**:
${weightsStr}
`
    }

    if (analysisData.values) {
      const valueDefsStr = Object.entries(analysisData.values.valueDefinitions)
        .map(([key, value]) => `  - **${key}**: ${value}`)
        .join('\n')
      analysisSection += `
### SCHOLARSHIP VALUES
- **Values Emphasized**: ${analysisData.values.valuesEmphasized.join(', ')}
- **Value Definitions**:
${valueDefsStr}
- **Evidence Phrases from Description**: ${analysisData.values.evidencePhrases.join('; ')}
`
    }

    if (analysisData.weights) {
      const weightsStr = Object.entries(analysisData.weights)
        .map(([category, data]) => {
          const subweightsStr = Object.entries(data.subweights)
            .map(([sub, weight]) => `    - ${sub}: ${(weight * 100).toFixed(0)}%`)
            .join('\n')
          return `  - **${category}** (${(data.weight * 100).toFixed(0)}%):\n${subweightsStr}`
        })
        .join('\n')
      analysisSection += `
### HIDDEN CRITERIA WEIGHTS
These weights indicate how much emphasis each criterion should receive in the essay:
${weightsStr}
`
    }
  }

  return `You are an expert scholarship essay writer. Your task is to write a compelling, personalized essay that maximizes the applicant's chances of winning this scholarship.

---

## SCHOLARSHIP INFORMATION

**Title**: ${title}

**Description**: ${desc}

**Essay Prompt**: ${prompt}

---
${analysisSection ? `
## SCHOLARSHIP ANALYSIS

The following analysis reveals what this scholarship truly values and how the essay should be crafted:
${analysisSection}
---
` : ''}
## TASK

Write a draft essay that:
1. Directly addresses the essay prompt
2. ${analysisData?.personality ? `Matches the ${analysisData.personality.toneStyle} tone and style expected by this scholarship` : 'Uses an appropriate tone for the scholarship'}
3. ${analysisData?.priorities ? `Emphasizes ${analysisData.priorities.primaryFocus} as the primary focus, allocating essay space proportional to the priority weights` : 'Emphasizes the key priorities of the scholarship'}
4. ${analysisData?.values ? `Demonstrates the values of ${analysisData.values.valuesEmphasized.slice(0, 3).join(', ')}` : 'Demonstrates relevant values'}
5. ${analysisData?.weights ? 'Addresses the hidden criteria according to their weights' : 'Addresses potential hidden criteria'}
6. ${analysisData?.personality ? `Follows the recommended essay focus: ${analysisData.personality.recommendedEssayFocus}` : 'Has a clear narrative focus'}

The essay should be approximately 500-750 words, well-structured with clear paragraphs, and compelling throughout.

CRITICAL: Return ONLY valid JSON. Do NOT use markdown code blocks. Do NOT add explanatory text.

Return JSON only:

{
  "essay": "the complete essay goes here"
}`
}

function getPromptForType(
  type: ClaudeRequestType,
  scholarshipTitle: string,
  scholarshipDescription: string,
  prompt: string,
): string {
  switch (type) {
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
    case 'promptWeights':
      return generateWeightsPrompt(
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

// Generate all analysis data for a prompt
export async function generateAllPromptAnalysis(
  scholarshipTitle: string,
  scholarshipDescription: string,
  prompt: string,
) {
  try {
    const [personality, priorities, values, weights] = await Promise.all([
      requestClaude<IPromptPersonality>(
        'promptPersonality',
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      ),
      requestClaude<IPromptPriorities>(
        'promptPriorities',
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      ),
      requestClaude<IPromptValues>(
        'promptValues',
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      ),
      requestClaude<IPromptWeights>(
        'promptWeights',
        scholarshipTitle,
        scholarshipDescription,
        prompt,
      ),
    ])

    return {
      personality,
      priorities,
      values,
      weights,
    }
  } catch (error) {
    console.error('Error generating prompt analysis:', error)
    throw error
  }
}

// Generate draft essay with analysis data from database
export async function generateDraftWithAnalysis(
  scholarshipId: string,
): Promise<IGenerateDraft> {
  try {
    // Retrieve scholarship with all analysis data from database
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: {
        promptPersonality: true,
        promptPriorities: true,
        promptValues: true,
        promptWeights: true,
      },
    })

    if (!scholarship) {
      throw new Error(`Scholarship not found: ${scholarshipId}`)
    }

    // Build analysis data from database records
    const analysisData: IDraftAnalysisData = {}

    if (scholarship.promptPersonality) {
      analysisData.personality = {
        spirit: scholarship.promptPersonality.spirit,
        toneStyle: scholarship.promptPersonality.toneStyle,
        valuesEmphasized: scholarship.promptPersonality.valuesEmphasized,
        recommendedEssayFocus: scholarship.promptPersonality.recommendedEssayFocus,
      }
    }

    if (scholarship.promptPriorities) {
      analysisData.priorities = {
        primaryFocus: scholarship.promptPriorities.primaryFocus,
        priorityWeights: scholarship.promptPriorities.priorityWeights as Record<string, number>,
      }
    }

    if (scholarship.promptValues) {
      analysisData.values = {
        valuesEmphasized: scholarship.promptValues.valuesEmphasized,
        valueDefinitions: scholarship.promptValues.valueDefinitions as Record<string, string>,
        evidencePhrases: scholarship.promptValues.evidencePhrases,
      }
    }

    if (scholarship.promptWeights) {
      analysisData.weights = scholarship.promptWeights.weights as Record<string, {
        weight: number
        subweights: Record<string, number>
      }>
    }

    // Generate the prompt with analysis data
    const llmPrompt = generateDraftPrompt(
      scholarship.title,
      scholarship.description,
      scholarship.prompt,
      analysisData,
    )

    // Call Claude to generate the draft
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048, // Increased for longer essays
      messages: [{ role: 'user', content: llmPrompt }],
    })

    const responseText = (message.content[0] as Anthropic.TextBlock).text

    // Parse response
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7)
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3)
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3)
    }
    jsonText = jsonText.trim()

    return JSON.parse(jsonText) as IGenerateDraft
  } catch (error) {
    console.error('Error generating draft with analysis:', error)
    throw new Error(
      `Failed to generate draft with analysis: ${(error as Error).message}`,
    )
  }
}
