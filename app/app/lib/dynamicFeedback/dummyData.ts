import { FeedbackData } from './types'

export function createDummyFeedbackData(
  essayId: string,
  scholarshipId: string,
): FeedbackData {
  return {
    id: `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    essayId,
    scholarshipId,
    problemTitle: 'Hidden Weight Type: Resiliency (40%)',
    sections: [
      {
        id: 'section-1',
        title: 'Describe: Missing Resiliency Experience',
        description:
          'Your essay lacks concrete examples of overcoming challenges. Please provide specific instances.',
        questions: [
          {
            id: 'q1',
            text: 'What challenges have you overcome in your academic or personal life?',
            answer: '',
            placeholder:
              'Example: I overcame financial hardship by working part-time while maintaining a 3.8 GPA...',
          },
          {
            id: 'q2',
            text: 'How did this experience change your perspective or approach to future challenges?',
            answer: '',
            placeholder:
              'Example: This taught me the value of perseverance and time management...',
          },
          {
            id: 'q3',
            text: 'What specific skills or strengths did you develop through this challenge?',
            answer: '',
            placeholder:
              'Example: I developed strong organizational skills and learned to prioritize effectively...',
          },
        ],
        isComplete: false,
      },
      {
        id: 'section-2',
        title: 'Strengthen: Leadership Impact',
        description:
          'Your leadership examples need more depth and measurable outcomes.',
        questions: [
          {
            id: 'q4',
            text: 'Describe a specific leadership role where you made a measurable impact.',
            answer: '',
            placeholder:
              'Example: As president of the coding club, I increased membership by 150%...',
          },
          {
            id: 'q5',
            text: 'What was the outcome of your leadership, and how did you measure success?',
            answer: '',
            placeholder:
              'Example: We completed 3 community projects and received recognition from the mayor...',
          },
        ],
        isComplete: false,
      },
      {
        id: 'section-3',
        title: 'Clarify: Community Service Motivation',
        description:
          'Explain why community service matters to you beyond just listing activities.',
        questions: [
          {
            id: 'q6',
            text: 'What drives your passion for community service?',
            answer: '',
            placeholder:
              'Example: Growing up in an underserved community showed me the importance of giving back...',
          },
          {
            id: 'q7',
            text: 'How do you plan to continue serving your community in the future?',
            answer: '',
            placeholder:
              'Example: I plan to establish a mentorship program for low-income students...',
          },
        ],
        isComplete: false,
      },
    ],
  }
}
