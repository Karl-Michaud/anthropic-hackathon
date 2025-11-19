import type { Meta, StoryObj } from '@storybook/react'
import ScholarshipInformationBlock from './ScholarshipInformationBlock'

const meta: Meta<typeof ScholarshipInformationBlock> = {
  title: 'Components/ScholarshipInformationBlock',
  component: ScholarshipInformationBlock,
  tags: ['autodocs'],
  argTypes: {
    scholarshipTitle: { control: 'text' },
    scholarshipDescription: { control: 'text' },
    scholarshipPrompt: { control: 'text' },
    hiddenCriterion: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof ScholarshipInformationBlock>

export const Default: Story = {
  args: {
    scholarshipTitle: 'Future Leaders Scholarship',
    scholarshipDescription:
      'This scholarship supports students who have shown exceptional leadership potential and a commitment to community service.',
    scholarshipPrompt:
      'Describe a time when you led a group or initiative that made a positive impact.',
    hiddenCriterion: [
      'Leadership',
      'Community Involvement',
      'Academic Excellence',
    ],
  },
}

export const Minimal: Story = {
  args: {
    scholarshipTitle: 'Academic Merit Award',
    scholarshipDescription: 'Awarded for outstanding academic performance.',
    scholarshipPrompt: 'What motivates you to pursue academic excellence?',
    hiddenCriterion: [],
  },
}
