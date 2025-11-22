import type { Preview } from '@storybook/nextjs'
import '../app/globals.css'
import { withContextProviders } from '../stories/decorators/ContextProviders'

const preview: Preview = {
  decorators: [withContextProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Default whiteboard canvas parameters
    whiteboardZoom: 1,
    whiteboardGrid: true,
    whiteboardCentered: true,
  },
}

export default preview
