import type { Meta, StoryObj } from '@storybook/nextjs'
import Navigation from '../app/components/sidebar/Navigation'

const meta: Meta<typeof Navigation> = {
  title: 'Components/Navigation',
  component: Navigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Navigation>

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="ml-24 p-10">
        <h1 className="text-2xl font-semibold">Page Content</h1>
        <p className="mt-2 text-gray-600">
          This area represents your main page content. The navigation should
          appear fixed to the left.
        </p>
      </div>
    </div>
  ),
}
