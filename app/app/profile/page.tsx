'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../components/auth/AuthProvider'
import { useDarkMode } from '../context/DarkModeContext'
import { useWhiteboard } from '../context/WhiteboardContext'
import { UserProfileForm } from '../components/UserProfileForm'
import { IUserProfile } from '../types/user-profile'
import {
  colorsLight,
  colorsDark,
  borderRadius,
  shadows,
  brandColors,
} from '../styles/design-system'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { userProfile, setUserProfile } = useWhiteboard()
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

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

  if (authLoading) {
    return (
      <div
        className="h-screen overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: colors.background.default }}
      >
        <div style={{ color: colors.text.primary }} className="text-xl">
          Loading...
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSubmit = async (profile: IUserProfile) => {
    await setUserProfile(profile)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      router.push('/whiteboard')
    }, 1500)
  }

  return (
    <div
      className="h-screen overflow-hidden flex items-center justify-center px-4 pt-4 pb-8"
      style={{ backgroundColor: colors.background.default }}
    >
      {/* Modal-style container */}
      <div
        ref={scrollContainerRef}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto relative scrollbar-hide m-auto"
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
            Update your profile
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: colors.text.secondary }}
          >
            Keep your information up to date for better essay personalization
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div
            className="mx-6 mt-6 p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: isDarkMode
                ? 'rgba(128, 128, 0, 0.2)'
                : 'rgba(128, 128, 0, 0.1)',
              border: `1px solid ${brandColors.olive}`,
              color: brandColors.olive,
            }}
          >
            <CheckCircle size={20} />
            <span className="font-medium">Profile updated successfully!</span>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <UserProfileForm onSubmit={handleSubmit} initialData={userProfile} />
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
