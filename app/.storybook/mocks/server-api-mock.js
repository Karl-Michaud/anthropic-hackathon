// Mock for server-side API functions that use Anthropic SDK
// This prevents them from running in browser/Storybook context

export async function analyzeSocratic() {
  console.warn('analyzeSocratic called in Storybook - returning mock data');
  return {
    highlightedSections: [],
    socraticData: {},
  };
}

export async function submitSocraticAnswers() {
  console.warn('submitSocraticAnswers called in Storybook - returning empty string');
  return '';
}

export async function analyzeFeedback() {
  console.warn('analyzeFeedback called in Storybook - returning mock data');
  return {
    id: 'mock-feedback-id',
    essayId: 'mock-essay-id',
    scholarshipId: 'mock-scholarship-id',
    createdAt: new Date().toISOString(),
    sections: [],
  };
}

export async function submitFeedback() {
  console.warn('submitFeedback called in Storybook - returning empty string');
  return '';
}

// Default export for compatibility
export default {
  analyzeSocratic,
  submitSocraticAnswers,
  analyzeFeedback,
  submitFeedback,
};
