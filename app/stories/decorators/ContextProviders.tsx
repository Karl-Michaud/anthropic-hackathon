import React from 'react'
import { Decorator } from '@storybook/react'
import { EditingProvider } from '../../app/context/EditingContext'
import { WhiteboardProvider } from '../../app/context/WhiteboardContext'
import { DarkModeProvider } from '../../app/context/DarkModeContext'

export const withContextProviders: Decorator = (Story) => {
  return (
    <DarkModeProvider>
      <WhiteboardProvider>
        <EditingProvider>
          <Story />
        </EditingProvider>
      </WhiteboardProvider>
    </DarkModeProvider>
  )
}
