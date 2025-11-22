import type { Meta, StoryObj } from '@storybook/nextjs'
import Cell from '../app/components/Cell'

const meta: Meta<typeof Cell> = {
  title: 'Components/Canvas/Cell',
  component: Cell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Cell>

const mockCell = {
  id: 'cell-1',
  x: 100,
  y: 100,
  color: 'yellow',
  text: 'Sample note',
  rotation: 2,
}

export const Default: Story = {
  args: {
    cell: mockCell,
    isDragging: false,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}

export const Yellow: Story = {
  args: {
    cell: { ...mockCell, color: 'yellow' },
    isDragging: false,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}

export const Blue: Story = {
  args: {
    cell: { ...mockCell, color: 'blue' },
    isDragging: false,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}

export const Pink: Story = {
  args: {
    cell: { ...mockCell, color: 'pink' },
    isDragging: false,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}

export const Green: Story = {
  args: {
    cell: { ...mockCell, color: 'green' },
    isDragging: false,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}

export const Purple: Story = {
  args: {
    cell: { ...mockCell, color: 'purple' },
    isDragging: false,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}

export const Orange: Story = {
  args: {
    cell: { ...mockCell, color: 'orange' },
    isDragging: false,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}

export const Dragging: Story = {
  args: {
    cell: mockCell,
    isDragging: true,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}

export const LongText: Story = {
  args: {
    cell: {
      ...mockCell,
      text: 'This is a longer note that might wrap to multiple lines',
    },
    isDragging: false,
    onMouseDown: () => {},
    onTextChange: () => {},
    onDelete: () => {},
  },
}
