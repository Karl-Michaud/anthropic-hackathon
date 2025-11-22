import type { Meta, StoryObj } from '@storybook/nextjs'
import DraggableToolbar from '../app/components/DraggableToolbar'

const meta: Meta<typeof DraggableToolbar> = {
  title: 'Components/Canvas/DraggableToolbar',
  component: DraggableToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof DraggableToolbar>

export const Default: Story = {
  args: {
    onAddCell: () => alert('Add cell button clicked'),
  },
  render: (args) => (
    <div className="relative w-full h-screen bg-gray-100">
      <DraggableToolbar {...args} />
      <div className="p-8">
        <p className="text-gray-600">The toolbar should appear draggable in the top-left corner</p>
      </div>
    </div>
  ),
}
