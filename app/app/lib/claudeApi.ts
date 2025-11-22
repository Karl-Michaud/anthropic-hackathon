'use server'

import Anthropic from '@anthropic-ai/sdk'
import { ScholarshipExtraction } from '../types/scholarship-extraction'
import type {
  AdaptiveWeightingInput,
  AdaptiveWeightingOutput,
} from '../types/adaptive-weighting'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Extract scholarship information using Claude
 */
export async function extractScholarshipInfo(
  content: string,
): Promise<ScholarshipExtraction> {
  const prompt = buildExtractionPrompt(content)

  try {
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

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    const extracted = parseExtractionResponse(responseText)

    return extracted
  } catch (error) {
    console.error('Extraction failed:', error)
    throw new Error(
      `Failed to extract scholarship information: ${(error as Error).message}`,
    )
  }
}

/**
 * Generate an essay using Claude
 */
export async function generateEssay(
  scholarshipTitle: string,
  scholarshipDescription: string,
  essayPrompt: string,
  maxWordCount?: number,
): Promise<string> {
  try {
    const wordCountInstruction = maxWordCount
      ? `The essay must be approximately ${maxWordCount} words (do not exceed this limit).`
      : 'Write a comprehensive essay of appropriate length.'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
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

    return essayContent
  } catch (error) {
    console.error('Essay generation error:', error)
    throw new Error(`Failed to generate essay: ${(error as Error).message}`)
  }
}

/**
 * Build the LLM prompt for extraction
 */
function buildExtractionPrompt(content: string): string {
  return `You are a scholarship information extraction system. Extract the following fields from the user's input and return ONLY valid JSON.

USER INPUT:
${content}

EXTRACTION TASK:
The user will provide information about a scholarship they are applying to and an essay prompt they are answering. Extract the following three fields:

1. **ScholarshipName** (string): The name of the scholarship. If not found, use "Missing".

2. **ScholarshipDescription** (string): Comprehensive information about the scholarship including:
   - Monetary amount of the scholarship
   - Eligibility criteria
   - Due date/deadline
   - Expected qualities and achievements of the applicant
   - Any other relevant details about the scholarship
   If not found, use "Missing".

3. **EssayPrompt** (string): The essay prompt/question that the applicant needs to answer. If not found, use "Missing".

IMPORTANT RULES:
- Return ONLY valid JSON, no other text
- Use "Missing" for any field that cannot be determined
- Keep all information in the ScholarshipDescription as a single comprehensive string
- Extract the essay prompt exactly as provided

RESPONSE FORMAT (JSON only):
{
  "ScholarshipName": "Name of the Scholarship",
  "ScholarshipDescription": "This scholarship offers $5000 to students enrolled in STEM programs with a GPA of 3.5 or higher. Deadline is March 15, 2025. Applicants should demonstrate innovation and technical achievement.",
  "EssayPrompt": "Describe a time when you demonstrated innovation in solving a technical problem."
}`
}

/**
 * Parse and validate the LLM response
 */
function parseExtractionResponse(response: string): ScholarshipExtraction {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const extraction: ScholarshipExtraction = {
      ScholarshipName: parsed.ScholarshipName || 'Missing',
      ScholarshipDescription: parsed.ScholarshipDescription || 'Missing',
      EssayPrompt: parsed.EssayPrompt || 'Missing',
      HiddenRequirements: parsed.HiddenRequirements || [],
    }

    return extraction
  } catch {
    console.error('Failed to parse LLM response:', response)
    throw new Error('Invalid response format from LLM')
  }
}

/**
 * Generate adaptive weights for a scholarship
 */
export async function generateAdaptiveWeights(
  input: AdaptiveWeightingInput,
): Promise<AdaptiveWeightingOutput> {
  const prompt = buildWeightingPrompt(input)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    const weights = parseWeightingResponse(responseText)

    return weights
  } catch (error) {
    console.error('Adaptive weighting failed:', error)
    throw new Error(
      `Failed to generate adaptive weights: ${(error as Error).message}`,
    )
  }
}

/**
 * Build the LLM prompt for weight analysis
 */
function buildWeightingPrompt(input: AdaptiveWeightingInput): string {
  return `You are an expert scholarship analysis system that identifies hidden criteria and assigns weights based on what scholarship committees truly value.

SCHOLARSHIP INFORMATION:
Name: ${input.ScholarshipName}
Description: ${input.ScholarshipDescription}
Essay Prompt: ${input.EssayPrompt}

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

/**
 * Parse and validate the weighting response
 */
function parseWeightingResponse(response: string): AdaptiveWeightingOutput {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate primary weights sum to 1.0
    const primaryWeights = [
      parsed['Sustained Depth Over Resume Padding']?.weight || 0,
      parsed['Values-Driven Decision Making']?.weight || 0,
      parsed['Problem-Solving Orientation']?.weight || 0,
      parsed['Entrepreneurial vs. Theoretical Mindset']?.weight || 0,
      parsed['Future Investment Potential']?.weight || 0,
      parsed['Adversity Plus Agency']?.weight || 0,
      parsed['Interview Performance']?.weight || 0,
      parsed['Language Mirroring & Framing']?.weight || 0,
      parsed['Regional & Nomination Strategy']?.weight || 0,
      parsed['Academic Threshold Sufficiency']?.weight || 0,
    ]

    const primarySum = primaryWeights.reduce((a, b) => a + b, 0)
    if (Math.abs(primarySum - 1.0) > 0.01) {
      console.warn(
        `Primary weights sum to ${primarySum}, expected 1.0. Normalizing...`,
      )
      const normalizedParsed = normalizeWeights(parsed, primarySum)
      return normalizedParsed as unknown as AdaptiveWeightingOutput
    }

    return parsed as unknown as AdaptiveWeightingOutput
  } catch {
    console.error('Failed to parse LLM response:', response)
    throw new Error('Invalid response format from LLM')
  }
}

/**
 * Normalize weights if they don't sum to 1.0
 */
function normalizeWeights(
  weights: Record<
    string,
    { weight: number; subweights: Record<string, number> }
  >,
  currentSum: number,
): Record<string, { weight: number; subweights: Record<string, number> }> {
  const normalized = { ...weights }
  const factor = 1.0 / currentSum

  for (const category of Object.keys(normalized)) {
    if (normalized[category]?.weight) {
      normalized[category].weight = Number(
        (normalized[category].weight * factor).toFixed(4),
      )
    }
  }

  return normalized
}
