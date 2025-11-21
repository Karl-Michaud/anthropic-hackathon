'use client'

import { Home } from 'lucide-react'
import { useState } from 'react'
import NavigationItem from './NavigationItem'
import ScholarshipUploadButton from './ScholarshipUploadButton'
import AccountButton from './AccountButton'
import ScholarshipUploadPopup from './ScholarshipUploadPopup'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
]

export default function Navigation() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  return (
    <>
      <div className="fixed left-4 top-4 bottom-4 z-50 rounded-2xl backdrop-blur-md bg-white/80 shadow-lg border border-white/80 p-3 flex flex-col items-center">
        {/* Top navigation items */}
        <nav className="flex flex-col gap-4 items-center py-4">
          {navItems.map(({ href, icon, label }) => (
            <NavigationItem
              key={href}
              href={href}
              icon={icon}
              label={label}
            />
          ))}
        </nav>

        {/* Spacer to push bottom items down */}
        <div className="flex-1" />

        {/* Bottom buttons */}
        <div className="flex flex-col gap-4 items-center py-4">
          <ScholarshipUploadButton onClick={() => setIsPopupOpen(true)} />
          <AccountButton />
        </div>
      </div>

      {/* Popup rendered outside sidebar - will be centered on screen */}
      <ScholarshipUploadPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </>
  )
}
