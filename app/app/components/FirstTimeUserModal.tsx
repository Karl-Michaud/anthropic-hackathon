'use client'

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
  const { isDarkMode } = useDarkMode()

  const colors = isDarkMode ? colorsDark : colorsLight

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
        className="w-full max-w-4xl relative"
        style={{
          backgroundColor: isDarkMode
            ? brandColors.componentBackgroundDark
            : brandColors.componentBackground,
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows.xl,
          border: `1px solid ${colors.border.default}`,
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
          <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
            Help us personalize your scholarship essay experience
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <UserProfileForm onSubmit={onComplete} />
        </div>
      </div>
    </div>
  )
}
