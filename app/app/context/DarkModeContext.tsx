'use client'

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  ReactNode,
} from 'react'

interface DarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
  isMounted: boolean
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  // Always start with false to match server rendering
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // After mounting on client, read the actual preference
  useLayoutEffect(() => {
    // Defer state updates to avoid cascading renders
    queueMicrotask(() => {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) {
        setIsDarkMode(JSON.parse(saved))
      } else {
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
      }
      setIsMounted(true)
    })
  }, [])

  // Update DOM and localStorage when dark mode changes
  useLayoutEffect(() => {
    if (!isMounted) return
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode, isMounted])

  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => !prev)
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, isMounted }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}
