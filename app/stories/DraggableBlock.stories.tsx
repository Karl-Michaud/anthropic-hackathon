import type { Meta, StoryObj } from '@storybook/nextjs'
import DraggableBlock from '../app/components/DraggableBlock'

const meta: Meta<typeof DraggableBlock> = {
  title: 'Components/Canvas/DraggableBlock',
  component: DraggableBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof DraggableBlock>

export const Default: Story = {
  args: {
    id: 'block-1',
    x: 100,
    y: 100,
    isDragging: false,
    onMouseDown: () => {},
    children: <div className="bg-white p-4 rounded shadow">Sample Block Content</div>,
  },
}

export const Dragging: Story = {
  args: {
    id: 'block-1',
    x: 100,
    y: 100,
    isDragging: true,
    onMouseDown: () => {},
    children: <div className="bg-white p-4 rounded shadow">Sample Block Content</div>,
  },
}

export const LargeBlock: Story = {
  args: {
    id: 'block-1',
    x: 100,
    y: 100,
    isDragging: false,
    onMouseDown: () => {},
    children: (
      <div className="bg-white p-4 rounded shadow w-96">
        <h3 className="font-bold mb-2">Large Block</h3>
        <p>This is a larger block with more content that demonstrates the size and layout.</p>
      </div>
    ),
  },
}
