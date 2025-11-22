'use server'

import { generateAdaptiveWeights } from './claudeApi'
import type { AdaptiveWeightingInput } from '../types/adaptive-weighting'

/**
 * Server function to fetch adaptive weights
 */
export async function fetchAdaptiveWeights(
  name: string,
  description: string,
  prompt: string,
) {
  try {
    const input: AdaptiveWeightingInput = {
      ScholarshipName: name,
      ScholarshipDescription: description,
      EssayPrompt: prompt,
    }

    const weights = await generateAdaptiveWeights(input)
    return weights
  } catch (err) {
    console.error('Failed to generate adaptive weights:', err)
  }
  return undefined
}
