interface ToolButtonProps {
  icon: React.ReactNode
  title: string
  isActive: boolean
  onClick: () => void
}

export default function ToolButton({
  icon,
  title,
  isActive,
  onClick,
}: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-600'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      title={title}
    >
      {icon}
    </button>
  )
}
