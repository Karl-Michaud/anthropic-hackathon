import type { Meta, StoryObj } from '@storybook/nextjs'
import DeleteButton from '../app/components/common/DeleteButton'

const meta: Meta<typeof DeleteButton> = {
  title: 'Components/UI/DeleteButton',
  component: DeleteButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof DeleteButton>

export const Default: Story = {
  args: {
    onClick: () => alert('Delete clicked'),
  },
}

export const Hovered: Story = {
  args: {
    onClick: () => alert('Delete clicked'),
  },
}
