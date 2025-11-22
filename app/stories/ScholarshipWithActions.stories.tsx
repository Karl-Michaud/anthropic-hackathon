import type { Meta, StoryObj } from '@storybook/nextjs'
import ScholarshipWithActions from '../app/components/scholarship/ScholarshipWithActions'

const meta: Meta<typeof ScholarshipWithActions> = {
  title: 'Components/Scholarship/ScholarshipWithActions',
  component: ScholarshipWithActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ScholarshipWithActions>

const mockScholarship = {
  id: 'scholarship-1',
  title: 'Tech Innovation Scholarship',
  description: 'Awarded to students demonstrating innovation in technology and creative problem-solving. The scholarship covers tuition and provides mentorship opportunities.',
  prompt: 'Describe a time when you used technology to solve a real-world problem.',
  hiddenRequirements: ['Innovation', 'Leadership'],
}

export const Default: Story = {
  args: {
    data: mockScholarship,
    onUpdate: (data) => console.log('Updated:', data),
    onDelete: (id) => console.log('Deleted:', id),
    onCreateDraft: (id) => console.log('Creating draft for:', id),
  },
}

export const WithoutHiddenRequirements: Story = {
  args: {
    data: {
      ...mockScholarship,
      hiddenRequirements: [],
    },
    onUpdate: (data) => console.log('Updated:', data),
    onDelete: (id) => console.log('Deleted:', id),
    onCreateDraft: (id) => console.log('Creating draft for:', id),
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
    onCreateDraft: (id) => console.log('Creating draft for:', id),
  },
}
