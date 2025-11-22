'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useEffect,
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
<<<<<<< Updated upstream
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
=======
  // Always start with false to match server rendering
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // After mounting on client, read the actual preference
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      setIsDarkMode(JSON.parse(saved))
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  // Update DOM and localStorage when dark mode changes
  useLayoutEffect(() => {
>>>>>>> Stashed changes
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
