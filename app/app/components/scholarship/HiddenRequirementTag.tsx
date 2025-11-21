interface HiddenRequirementTagProps {
  text: string
}

export default function HiddenRequirementTag({ text }: HiddenRequirementTagProps) {
  return (
    <span className="inline-block rounded-full px-3 py-1 bg-gray-800 text-white text-xs font-medium">
      {text}
    </span>
  )
}
