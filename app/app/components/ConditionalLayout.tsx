'use client'

import { useAuth } from './auth/AuthProvider'
import Navigation from './Navigation'
import { usePathname } from 'next/navigation'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Don't show navigation on landing page or while loading
  const showNavigation = !loading && user && pathname !== '/'

  if (showNavigation) {
    return (
      <div className="relative flex">
        <Navigation />
        <main className="flex-1 p-6">{children}</main>
      </div>
    )
  }

  // No navigation - full width
  return <main className="w-full">{children}</main>
}
