import type { Meta, StoryObj } from '@storybook/nextjs'
import EssayBlock from '../app/components/EssayBlock'

const meta: Meta<typeof EssayBlock> = {
  title: 'Components/Essay/EssayBlock',
  component: EssayBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof EssayBlock>

const mockEssay = {
  id: 'essay-1',
  scholarshipId: 'scholarship-1',
  content: `When I first encountered the broken water filtration system in our community center, I didn't just see a problem—I saw an opportunity to apply my technical skills for real impact. As a computer science student with a passion for IoT solutions, I immediately began researching how technology could improve the situation.

I collaborated with two classmates and our engineering teacher to design a smart monitoring system using Arduino and cloud connectivity. Within three months, we had a working prototype that could track water quality metrics and alert maintenance staff automatically.

This experience taught me that innovation isn't just about the technology—it's about understanding people's needs and creating meaningful solutions.`,
  maxWordCount: 500,
}

export const Default: Story = {
  args: {
    data: mockEssay,
    scholarshipTitle: 'Tech Innovation Scholarship',
    onUpdate: () => {},
    onDelete: () => {},
    isGenerating: false,
  },
}

export const Generating: Story = {
  args: {
    data: mockEssay,
    scholarshipTitle: 'Tech Innovation Scholarship',
    onUpdate: () => {},
    onDelete: () => {},
    isGenerating: true,
  },
}

export const EmptyEssay: Story = {
  args: {
    data: {
      ...mockEssay,
      content: '',
    },
    scholarshipTitle: 'Tech Innovation Scholarship',
    onUpdate: () => {},
    onDelete: () => {},
    isGenerating: false,
  },
}

export const LongEssay: Story = {
  args: {
    data: {
      ...mockEssay,
      content: mockEssay.content + '\n\n' + mockEssay.content + '\n\n' + mockEssay.content,
    },
    scholarshipTitle: 'Tech Innovation Scholarship',
    onUpdate: () => {},
    onDelete: () => {},
    isGenerating: false,
  },
}

export const WithoutTitle: Story = {
  args: {
    data: mockEssay,
    scholarshipTitle: undefined,
    onUpdate: () => {},
    onDelete: () => {},
    isGenerating: false,
  },
}
