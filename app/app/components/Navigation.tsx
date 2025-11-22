import NextLink from 'next/link'
import { Home, Plus, User } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function Navigation() {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl backdrop-blur-md bg-white/80 shadow-lg border border-white/80 p-3 flex flex-col items-center">
      <nav className="flex flex-col gap-4 items-center py-4">
        {navItems.map(({ href, icon: Icon, label }) => (
          <NextLink
            key={href}
            href={href}
            className="group relative p-2 rounded-xl transition-all duration-200 hover:bg-white/40 hover:scale-105"
            aria-label={label}
          >
            <Icon
              className="text-gray-500 group-hover:text-gray-600"
              size={28}
            />
            <span className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded-md px-2 py-1 transition-all duration-200">
              {label}
            </span>
          </NextLink>
        ))}
        <button className="hover:cursor-pointer group relative p-2 rounded-xl transition-all duration-200 hover:bg-white/40 hover:scale-105">
          <Plus className="text-gray-500 group-hover:text-gray-600" size={28} />
          <span className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded-md px-2 py-1 transition-all duration-200">
            Create
          </span>
        </button>
      </nav>
    </div>
  )
}
