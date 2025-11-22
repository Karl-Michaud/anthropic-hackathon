export interface Question {
  id: string
  text: string
  answer: string
  placeholder?: string
}

export interface FeedbackSection {
  id: string
  title: string
  description?: string
  questions: Question[]
  isComplete: boolean
}

export interface FeedbackData {
  id: string // feedback panel ID
  essayId: string
  scholarshipId: string
  problemTitle: string
  sections: FeedbackSection[]
  createdAt: number
}

export interface QuestionProps {
  question: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export interface FeedbackSectionProps {
  title: string
  description?: string
  questions: Question[]
  isComplete: boolean
  onAnswerChange: (questionId: string, answer: string) => void
  onComplete: () => void
}

export interface FeedbackPanelProps {
  data: FeedbackData
  onClose: () => void
  onSectionAnswerChange: (
    sectionId: string,
    questionId: string,
    answer: string,
  ) => void
  onSectionComplete: (sectionId: string) => void
  onSubmitToAI: () => void
}
