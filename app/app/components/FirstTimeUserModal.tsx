'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'
import { UserProfileForm } from './UserProfileForm'
import { IUserProfile } from '../types/user-profile'
import {
  colorsLight,
  colorsDark,
  borderRadius,
  shadows,
  brandColors,
} from '../styles/design-system'

interface FirstTimeUserModalProps {
  onComplete: (profile: IUserProfile) => void
}

export function FirstTimeUserModal({ onComplete }: FirstTimeUserModalProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const colors = isDarkMode ? colorsDark : colorsLight

  // Handle scroll to hide indicator
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (container.scrollTop > 50) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: isDarkMode
          ? 'rgba(0, 0, 0, 0.8)'
          : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        ref={scrollContainerRef}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto relative scrollbar-hide"
        style={{
          backgroundColor: isDarkMode
            ? brandColors.componentBackgroundDark
            : brandColors.componentBackground,
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows.xl,
          border: `1px solid ${colors.border.default}`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{ borderColor: colors.border.default }}
        >
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Welcome! Let&apos;s set up your profile
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: colors.text.secondary }}
          >
            Help us personalize your scholarship essay experience
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <UserProfileForm onSubmit={onComplete} isModal />
        </div>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div
            className="sticky bottom-0 left-0 right-0 flex justify-center pb-4 pt-2 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${
                isDarkMode
                  ? brandColors.componentBackgroundDark
                  : brandColors.componentBackground
              } 60%, transparent)`,
            }}
          >
            <div
              className="animate-bounce p-2 rounded-full"
              style={{
                backgroundColor: isDarkMode
                  ? 'rgba(0, 128, 128, 0.2)'
                  : 'rgba(0, 128, 128, 0.1)',
              }}
            >
              <ChevronDown
                size={20}
                style={{ color: brandColors.teal }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
