import NextLink from 'next/link'
import { LucideIcon } from 'lucide-react'

interface NavigationItemProps {
  href: string
  icon: LucideIcon
  label: string
}

export default function NavigationItem({
  href,
  icon: Icon,
  label,
}: NavigationItemProps) {
  return (
    <NextLink
      href={href}
      className="group relative p-2 rounded-xl transition-all duration-200 hover:bg-white/40 hover:scale-105 cursor-pointer"
      aria-label={label}
    >
      <Icon className="text-gray-500 group-hover:text-gray-600" size={28} />
      <span className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded-md px-2 py-1 transition-all duration-200">
        {label}
      </span>
    </NextLink>
  )
}
