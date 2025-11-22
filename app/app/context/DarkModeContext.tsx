'use client'

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useEffect,
  ReactNode,
} from 'react'

interface DarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  // Initialize with false to match server-side rendering
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Sync dark mode on mount to avoid hydration mismatch
  useLayoutEffect(() => {
    const saved = localStorage.getItem('darkMode')
    const darkMode =
      saved !== null
        ? JSON.parse(saved)
        : window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(darkMode)
    setIsMounted(true)
  }, [])

  // Update DOM and localStorage when dark mode changes
  useEffect(() => {
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
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
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
