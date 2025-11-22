import type { Meta, StoryObj } from '@storybook/nextjs'
import JsonOutputBlock from '../app/components/scholarship/JsonOutputBlock'

const meta: Meta<typeof JsonOutputBlock> = {
  title: 'Components/Scholarship/JsonOutputBlock',
  component: JsonOutputBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof JsonOutputBlock>

const mockData = {
  ScholarshipName: 'Community Excellence Scholarship',
  ScholarshipDescription: 'Award for students demonstrating community leadership and academic excellence.',
  EssayPrompt: 'Describe how you have positively impacted your community.',
  HiddenRequirements: ['Leadership', 'Community Service'],
}

export const Default: Story = {
  args: {
    data: mockData,
    onDelete: () => alert('Delete clicked'),
  },
}

export const SimpleData: Story = {
  args: {
    data: {
      ScholarshipName: 'Merit Scholarship',
      ScholarshipDescription: 'Awarded to top academic performers.',
      EssayPrompt: 'Explain your academic achievements.',
    },
    onDelete: () => alert('Delete clicked'),
  },
}

export const WithHiddenRequirements: Story = {
  args: {
    data: {
      ScholarshipName: 'Innovation Award',
      ScholarshipDescription: 'For innovative thinkers and problem solvers.',
      EssayPrompt: 'Describe an innovative solution you created.',
      HiddenRequirements: ['STEM Background', 'Research Experience', 'Leadership Skills'],
    },
    onDelete: () => alert('Delete clicked'),
  },
}
