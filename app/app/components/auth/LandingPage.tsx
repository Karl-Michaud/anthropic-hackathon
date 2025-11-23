'use client'

import { AuthForm } from './AuthForm'
import { useDarkMode } from '@/app/context/DarkModeContext'
import { colorsLight, colorsDark, typography } from '@/app/styles/design-system'

export function LandingPage() {
  const { isDarkMode } = useDarkMode()

  const colors = isDarkMode ? colorsDark : colorsLight

  const dotOpacity = 0.3
  const dotColor = isDarkMode
    ? `rgba(177, 173, 161, ${dotOpacity})`
    : `rgba(177, 173, 161, ${dotOpacity})`
  const dotSize = 24

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center px-4 transition-colors duration-200"
      style={{
        backgroundColor: colors.background.default,
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: `${dotSize}px ${dotSize}px`,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      {/* Logo/Title */}
      <div className="mb-8 text-center">
        <h1
          className="text-5xl font-bold mb-3"
          style={{
            color: colors.text.primary,
            fontFamily: typography.fonts.serif,
          }}
        >
          Socratic.ai
        </h1>
        <p
          className="text-lg"
          style={{
            color: colors.text.secondary,
            fontFamily: typography.fonts.serif,
          }}
        >
          Organize, draft, and refine your scholarship essays
        </p>
      </div>

      {/* Auth Form */}
      <AuthForm />

      {/* Footer */}
      <div className="mt-8 text-sm" style={{ color: colors.text.secondary }}>
        Built for organizing scholarship applications
      </div>
    </div>
  )
}
