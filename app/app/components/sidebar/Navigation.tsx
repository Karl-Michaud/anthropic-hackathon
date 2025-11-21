'use client'

import { Home } from 'lucide-react'
import { useState } from 'react'
import NavigationItem from './NavigationItem'
import ScholarshipUploadButton from './ScholarshipUploadButton'
import AccountButton from './AccountButton'
import ScholarshipUploadPopup, { ScholarshipUploadResult } from './ScholarshipUploadPopup'
import { useWhiteboard } from '../../context/WhiteboardContext'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
]

export default function Navigation() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const { addScholarship, addJsonOutput } = useWhiteboard()

  const handleScholarshipCreated = (data: ScholarshipUploadResult) => {
    const scholarshipId = addScholarship({
      title: data.title,
      description: data.description,
      prompt: data.prompt,
      hiddenRequirements: data.hiddenRequirements,
    })

    // Also add the JSON output block
    addJsonOutput(scholarshipId, {
      ScholarshipName: data.title,
      ScholarshipDescription: data.description,
      EssayPrompt: data.prompt,
      HiddenRequirements: data.hiddenRequirements,
    })
  }

  return (
    <>
      <div className="fixed left-6 top-6 bottom-6 z-50 rounded-2xl backdrop-blur-md bg-white/80 shadow-lg border border-white/80 p-2 flex flex-col items-center">
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
      <ScholarshipUploadPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onScholarshipCreated={handleScholarshipCreated}
      />
    </>
  )
}
