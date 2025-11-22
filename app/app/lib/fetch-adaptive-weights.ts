/**
 * Shared utility to fetch adaptive weights from the API
 */

export async function fetchAdaptiveWeights(
  name: string,
  description: string,
  prompt: string
) {
  try {
    const response = await fetch('/api/adaptive-weighting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ScholarshipName: name,
        ScholarshipDescription: description,
        EssayPrompt: prompt,
      }),
    })

    const result = await response.json()
    if (result.success && result.data) {
      return result.data
    }
  } catch (err) {
    console.error('Failed to fetch adaptive weights:', err)
  }
  return undefined
}
