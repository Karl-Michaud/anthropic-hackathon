import type { Meta, StoryObj } from '@storybook/nextjs'
import EditableField from '../app/components/scholarship/EditableField'

const meta: Meta<typeof EditableField> = {
  title: 'Components/Scholarship/EditableField',
  component: EditableField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof EditableField>

export const EditingDisabled: Story = {
  args: {
    value: 'Sample field content',
    onChange: () => {},
    isEditing: false,
  },
}

export const EditingEnabled: Story = {
  args: {
    value: 'Sample field content',
    onChange: (value) => console.log('Changed to:', value),
    isEditing: true,
  },
}

export const Title: Story = {
  args: {
    value: 'Scholarship Title',
    onChange: (value) => console.log('Changed to:', value),
    isEditing: false,
    isTitle: true,
    className: 'text-3xl font-bold',
  },
}

export const TitleEditing: Story = {
  args: {
    value: 'Scholarship Title',
    onChange: (value) => console.log('Changed to:', value),
    isEditing: true,
    isTitle: true,
    className: 'text-3xl font-bold',
  },
}

export const WithPlaceholder: Story = {
  args: {
    value: '',
    onChange: (value) => console.log('Changed to:', value),
    isEditing: false,
    placeholder: 'Enter field content',
  },
}

export const LongContent: Story = {
  args: {
    value: 'This is a longer piece of content that might span multiple lines when displayed or edited. It demonstrates how the field handles more text content.',
    onChange: (value) => console.log('Changed to:', value),
    isEditing: false,
  },
}
