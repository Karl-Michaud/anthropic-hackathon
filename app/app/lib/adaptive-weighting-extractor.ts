/**
 * LLM-powered adaptive weighting extractor
 * Uses Anthropic Claude to analyze scholarship descriptions and generate
 * weighted criteria for essay optimization
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  AdaptiveWeightingInput,
  AdaptiveWeightingOutput,
} from "../types/adaptive-weighting";

/**
 * Initialize Anthropic client
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyze scholarship and generate adaptive weights
 * @param input - Scholarship name, description, and essay prompt
 * @returns Weighted criteria structure
 */
export async function generateAdaptiveWeights(
  input: AdaptiveWeightingInput
): Promise<AdaptiveWeightingOutput> {
  const prompt = buildWeightingPrompt(input);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    const weights = parseWeightingResponse(responseText);

    return weights;
  } catch (error) {
    console.error("Adaptive weighting failed:", error);
    throw new Error(
      `Failed to generate adaptive weights: ${(error as Error).message}`
    );
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

Analyze the scholarship and return ONLY the JSON with your calculated weights.`;
}

/**
 * Parse and validate the LLM response
 */
function parseWeightingResponse(response: string): AdaptiveWeightingOutput {
  try {
    // Extract JSON from response (in case LLM adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate primary weights sum to 1.0
    const primaryWeights = [
      parsed["Sustained Depth Over Resume Padding"]?.weight || 0,
      parsed["Values-Driven Decision Making"]?.weight || 0,
      parsed["Problem-Solving Orientation"]?.weight || 0,
      parsed["Entrepreneurial vs. Theoretical Mindset"]?.weight || 0,
      parsed["Future Investment Potential"]?.weight || 0,
      parsed["Adversity Plus Agency"]?.weight || 0,
      parsed["Interview Performance"]?.weight || 0,
      parsed["Language Mirroring & Framing"]?.weight || 0,
      parsed["Regional & Nomination Strategy"]?.weight || 0,
      parsed["Academic Threshold Sufficiency"]?.weight || 0,
    ];

    const primarySum = primaryWeights.reduce((a, b) => a + b, 0);
    if (Math.abs(primarySum - 1.0) > 0.01) {
      console.warn(
        `Primary weights sum to ${primarySum}, expected 1.0. Normalizing...`
      );
      // Normalize if needed
      const normalizedParsed = normalizeWeights(parsed, primarySum);
      return normalizedParsed as AdaptiveWeightingOutput;
    }

    return parsed as AdaptiveWeightingOutput;
  } catch (error) {
    console.error("Failed to parse LLM response:", response);
    throw new Error("Invalid response format from LLM");
  }
}

/**
 * Normalize weights if they don't sum to 1.0
 */
function normalizeWeights(
  weights: Record<string, { weight: number; subweights: Record<string, number> }>,
  currentSum: number
): Record<string, { weight: number; subweights: Record<string, number> }> {
  const normalized = { ...weights };
  const factor = 1.0 / currentSum;

  for (const category of Object.keys(normalized)) {
    if (normalized[category]?.weight) {
      normalized[category].weight = Number(
        (normalized[category].weight * factor).toFixed(4)
      );
    }
  }

  return normalized;
}
