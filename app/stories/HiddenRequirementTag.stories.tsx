import type { Meta, StoryObj } from '@storybook/nextjs'
import HiddenRequirementTag from '../app/components/scholarship/HiddenRequirementTag'

const meta: Meta<typeof HiddenRequirementTag> = {
  title: 'Components/Scholarship/HiddenRequirementTag',
  component: HiddenRequirementTag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof HiddenRequirementTag>

export const Innovation: Story = {
  args: {
    text: 'Innovation',
  },
}

export const Leadership: Story = {
  args: {
    text: 'Leadership',
  },
}

export const CommunityService: Story = {
  args: {
    text: 'Community Service',
  },
}

export const AcademicExcellence: Story = {
  args: {
    text: 'Academic Excellence',
  },
}

export const Entrepreneurship: Story = {
  args: {
    text: 'Entrepreneurship',
  },
}

export const LongText: Story = {
  args: {
    text: 'Demonstrated Leadership Skills',
  },
}

export const Multiple: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <HiddenRequirementTag text="Innovation" />
      <HiddenRequirementTag text="Leadership" />
      <HiddenRequirementTag text="Community Service" />
      <HiddenRequirementTag text="Academic Excellence" />
    </div>
  ),
}
