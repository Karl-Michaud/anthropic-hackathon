import type { Meta, StoryObj } from '@storybook/nextjs'
import ScholarshipBlock from '../app/components/ScholarshipBlock'

const meta: Meta<typeof ScholarshipBlock> = {
  title: 'Components/Scholarship/ScholarshipBlock',
  component: ScholarshipBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ScholarshipBlock>

const mockScholarship = {
  id: 'scholarship-1',
  title: 'Tech Innovation Scholarship',
  description: 'Awarded to students demonstrating innovation in technology and creative problem-solving.',
  prompt: 'Describe a time when you used technology to solve a real-world problem.',
  hiddenRequirements: ['Innovation', 'Leadership', 'Technical Skills'],
}

export const Default: Story = {
  args: {
    data: mockScholarship,
    onUpdate: () => {},
    onDelete: () => {},
  },
}

export const WithoutHiddenRequirements: Story = {
  args: {
    data: {
      ...mockScholarship,
      hiddenRequirements: [],
    },
    onUpdate: () => {},
    onDelete: () => {},
  },
}

export const LongDescription: Story = {
  args: {
    data: {
      ...mockScholarship,
      description: `This is a comprehensive scholarship for students interested in technology and innovation.
      We are looking for individuals who can demonstrate:
      - Strong technical capabilities
      - Creative problem-solving skills
      - Leadership potential
      - Commitment to making a positive impact

      The scholarship covers full tuition and provides mentorship opportunities.`,
    },
    onUpdate: () => {},
    onDelete: () => {},
  },
}

export const MultipleHiddenRequirements: Story = {
  args: {
    data: {
      ...mockScholarship,
      hiddenRequirements: ['Innovation', 'Leadership', 'Technical Skills', 'Communication', 'Entrepreneurship'],
    },
    onUpdate: () => {},
    onDelete: () => {},
  },
}
