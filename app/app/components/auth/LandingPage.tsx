'use client'

import { AuthForm } from './AuthForm'
import { useDarkMode } from '@/app/context/DarkModeContext'
import { colorsLight, colorsDark, typography } from '@/app/styles/design-system'
import { useEffect, useState } from 'react'

export function LandingPage() {
  const { isDarkMode } = useDarkMode()
  const [asciiArt, setAsciiArt] = useState<string>('')

  const colors = isDarkMode ? colorsDark : colorsLight

  const dotOpacity = 0.3
  const dotColor = isDarkMode
    ? `rgba(177, 173, 161, ${dotOpacity})`
    : `rgba(177, 173, 161, ${dotOpacity})`
  const dotSize = 24

  useEffect(() => {
    fetch('/ascii-art 2.txt')
      .then((res) => res.text())
      .then((text) => setAsciiArt(text))
      .catch((err) => console.error('Failed to load ASCII art:', err))
  }, [])

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
      {/* ASCII Art Layer */}
      {asciiArt && (
        <pre
          className="absolute inset-0 flex items-end justify-center pointer-events-none"
          style={{
            color: isDarkMode
              ? 'rgba(177, 173, 161, 0.2)'
              : 'rgba(177, 173, 161, 0.8)',
            fontSize: '8px',
            lineHeight: '1.2',
            fontFamily: 'monospace',
            whiteSpace: 'pre',
            overflow: 'hidden',
            textAlign: 'center',
            zIndex: 1,
            width: '100vw',
            letterSpacing: '0.2em',
            transform: 'translateY(0%)',
          }}
        >
          {asciiArt}
        </pre>
      )}

      {/* Content Layer */}
      <div
        className="flex flex-col items-center justify-center"
        style={{ zIndex: 2, position: 'relative' }}
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
              color: colors.text.primary,
              fontFamily: typography.fonts.serif,
            }}
          >
            Tailor Your Scholarship Essays with Critical Thinkers.
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm />

        {/* Footer */}
        <div className="mt-8 text-sm" style={{ color: colors.text.primary }}>
          Made for the UofT x Anthropic Hackathon
        </div>
      </div>
    </div>
  )
}
