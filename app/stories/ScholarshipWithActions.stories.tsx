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

export const Default: Story = {
  args: {
    onDraft: () => console.log('Draft created'),
    isGenerating: false,
  },
}

export const Generating: Story = {
  args: {
    onDraft: () => console.log('Draft created'),
    isGenerating: true,
  },
}
