import type { Meta, StoryObj } from '@storybook/nextjs'
import UploadModeToggle from '../app/components/sidebar/UploadModeToggle'

const meta: Meta<typeof UploadModeToggle> = {
  title: 'Components/Sidebar/UploadModeToggle',
  component: UploadModeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof UploadModeToggle>

export const FileMode: Story = {
  args: {
    mode: 'file',
    onModeChange: (mode: 'file' | 'text') => console.log('Mode changed to:', mode),
  },
}

export const TextMode: Story = {
  args: {
    mode: 'text',
    onModeChange: (mode: 'file' | 'text') => console.log('Mode changed to:', mode),
  },
}
