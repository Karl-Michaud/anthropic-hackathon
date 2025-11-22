import type { Meta, StoryObj } from '@storybook/nextjs'
import WordCounter from '../app/components/essay/WordCounter'

const meta: Meta<typeof WordCounter> = {
  title: 'Components/Essay/WordCounter',
  component: WordCounter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof WordCounter>

export const LowWordCount: Story = {
  args: {
    currentCount: 50,
    maxCount: 500,
  },
}

export const MediumWordCount: Story = {
  args: {
    currentCount: 250,
    maxCount: 500,
  },
}

export const HighWordCount: Story = {
  args: {
    currentCount: 450,
    maxCount: 500,
  },
}

export const ExceededWordCount: Story = {
  args: {
    currentCount: 550,
    maxCount: 500,
  },
}

export const NoMax: Story = {
  args: {
    currentCount: 1234,
    maxCount: undefined,
  },
}

export const Empty: Story = {
  args: {
    currentCount: 0,
    maxCount: 500,
  },
}
