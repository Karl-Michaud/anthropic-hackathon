'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface EditingContextType {
  isEditing: boolean
  setEditing: (editing: boolean) => void
}

const EditingContext = createContext<EditingContextType | null>(null)

export function EditingProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)

  const setEditing = useCallback((editing: boolean) => {
    setIsEditing(editing)
  }, [])

  return (
    <EditingContext.Provider value={{ isEditing, setEditing }}>
      {children}
    </EditingContext.Provider>
  )
}

export function useEditing() {
  const context = useContext(EditingContext)
  if (!context) {
    throw new Error('useEditing must be used within an EditingProvider')
  }
  return context
}
