'use client'

import { AuthForm } from './AuthForm'
import { useDarkMode } from '@/app/context/DarkModeContext'

export function LandingPage() {
  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const dotOpacity = 1
  const dotColor = isDarkMode
    ? `rgba(107, 114, 128, ${dotOpacity})`
    : `rgba(208, 201, 184, ${dotOpacity})`
  const dotSize = 24

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-neutral-50'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: `${dotSize}px ${dotSize}px`,
      }}
    >
      {/* Logo/Title */}
      <div className="mb-8 text-center">
        <h1
          className={`text-5xl font-bold mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Scholarship Essay Whiteboard
        </h1>
        <p
          className={`text-lg ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Organize, draft, and refine your scholarship essays
        </p>
      </div>

      {/* Auth Form */}
      <AuthForm />

      {/* Footer */}
      <div
        className={`mt-8 text-sm ${
          isDarkMode ? 'text-gray-500' : 'text-gray-500'
        }`}
      >
        Built for organizing scholarship applications
      </div>
    </div>
  )
}
