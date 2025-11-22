import type { Meta, StoryObj } from '@storybook/nextjs'
import ZoomComponent from '../app/components/ZoomComponent'

const meta: Meta<typeof ZoomComponent> = {
  title: 'Components/UI/ZoomComponent',
  component: ZoomComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    zoom: {
      control: { type: 'range', min: 0.3, max: 1, step: 0.1 },
      description: 'Current zoom level',
    },
  },
}

export default meta
type Story = StoryObj<typeof ZoomComponent>

export const Default: Story = {
  args: {
    zoom: 1,
    onZoomIn: () => alert('Zoom in'),
    onZoomOut: () => alert('Zoom out'),
  },
}

export const ZoomedIn: Story = {
  args: {
    zoom: 1,
    onZoomIn: () => alert('Zoom in'),
    onZoomOut: () => alert('Zoom out'),
  },
}

export const ZoomedOut: Story = {
  args: {
    zoom: 0.5,
    onZoomIn: () => alert('Zoom in'),
    onZoomOut: () => alert('Zoom out'),
  },
}

export const MinZoom: Story = {
  args: {
    zoom: 0.3,
    onZoomIn: () => alert('Zoom in'),
    onZoomOut: () => alert('Zoom out'),
  },
}

export const MaxZoom: Story = {
  args: {
    zoom: 1,
    onZoomIn: () => alert('Zoom in'),
    onZoomOut: () => alert('Zoom out'),
  },
}
