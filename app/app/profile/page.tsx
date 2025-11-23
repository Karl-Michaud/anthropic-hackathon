'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../components/auth/AuthProvider'
import { useDarkMode } from '../context/DarkModeContext'
import { useWhiteboard } from '../context/WhiteboardContext'
import { UserProfileForm } from '../components/UserProfileForm'
import { IUserProfile } from '../types/user-profile'
import { colorsLight, colorsDark, brandColors } from '../styles/design-system'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { userProfile, setUserProfile } = useWhiteboard()
  const { isDarkMode } = useDarkMode()
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
        style={{
          backgroundColor: isDarkMode
            ? brandColors.backgroundDark
            : brandColors.pampas,
        }}
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
      ref={scrollContainerRef}
      className="-m-6 h-screen overflow-y-auto px-4 pt-8 pb-8 scrollbar-hide"
      style={{
        backgroundColor: isDarkMode
          ? brandColors.backgroundDark
          : brandColors.pampas,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Update your profile
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
            Keep your information up to date for better essay personalization
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
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
        <UserProfileForm onSubmit={handleSubmit} initialData={userProfile} />

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div
              className="animate-bounce p-2 rounded-full"
              style={{
                backgroundColor: isDarkMode
                  ? 'rgba(0, 128, 128, 0.2)'
                  : 'rgba(0, 128, 128, 0.1)',
              }}
            >
              <ChevronDown size={20} style={{ color: brandColors.teal }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
