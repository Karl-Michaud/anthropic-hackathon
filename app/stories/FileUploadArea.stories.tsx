import type { Meta, StoryObj } from '@storybook/nextjs'
import FileUploadArea from '../app/components/sidebar/FileUploadArea'

const meta: Meta<typeof FileUploadArea> = {
  title: 'Components/Sidebar/FileUploadArea',
  component: FileUploadArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof FileUploadArea>

export const Default: Story = {
  args: {
    onFileUpload: (file: File) => console.log('File uploaded:', file.name),
    isUploading: false,
  },
}

export const Uploading: Story = {
  args: {
    onFileUpload: (file: File) => console.log('File uploaded:', file.name),
    isUploading: true,
  },
}
