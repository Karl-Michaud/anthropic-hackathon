import type { Meta, StoryObj } from '@storybook/nextjs'
import ManualEntryForm from '../app/components/sidebar/ManualEntryForm'

const meta: Meta<typeof ManualEntryForm> = {
  title: 'Components/Sidebar/ManualEntryForm',
  component: ManualEntryForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ManualEntryForm>

export const Default: Story = {
  args: {
    onSubmit: (title: string, description: string, prompts: string[]) => {
      console.log('Submitted:', { title, description, prompts })
    },
    isSubmitting: false,
  },
}

export const Submitting: Story = {
  args: {
    onSubmit: (title: string, description: string, prompts: string[]) => {
      console.log('Submitted:', { title, description, prompts })
    },
    isSubmitting: true,
  },
}
