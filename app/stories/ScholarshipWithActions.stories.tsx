import type { Meta, StoryObj } from '@storybook/nextjs'
import { ScholarshipActions } from '../app/components/ScholarshipBlock'

const meta: Meta<typeof ScholarshipActions> = {
  title: 'Components/Scholarship/ScholarshipActions',
  component: ScholarshipActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ScholarshipActions>

const mockScholarship = {
  id: 'scholarship-1',
  title: 'Tech Innovation Scholarship',
  description:
    'Awarded to students demonstrating innovation in technology and creative problem-solving. The scholarship covers tuition and provides mentorship opportunities.',
  prompt:
    'Describe a time when you used technology to solve a real-world problem.',
}

export const Default: Story = {
  args: {
    data: mockScholarship,
    onUpdate: (data) => console.log('Updated:', data),
    onDelete: (id) => console.log('Deleted:', id),
  },
}

export const LongDescription: Story = {
  args: {
    data: {
      ...mockScholarship,
      description: `This is a comprehensive scholarship program for students interested in technology and innovation.

      Eligibility Requirements:
      - Current undergraduate or graduate student
      - Strong GPA (3.5+)
      - Demonstrated interest in technology
      - Community involvement

      Application Requirements:
      - Resume
      - Essay (500-1000 words)
      - Two letters of recommendation
      - Portfolio of technical projects

      Selection Criteria:
      - Technical excellence
      - Innovation and creativity
      - Leadership potential
      - Community impact`,
    },
    onUpdate: (data) => console.log('Updated:', data),
    onDelete: (id) => console.log('Deleted:', id),
  },
}
