import {
  colors,
  borderRadius,
  spacing,
  transitions,
  shadows,
} from '../../styles/design-system'

interface HiddenRequirementTagProps {
  text: string
}

export default function HiddenRequirementTag({
  text,
}: HiddenRequirementTagProps) {
  return (
    <span
      className="inline-flex items-center transition-all hover:scale-105"
      style={{
        paddingLeft: spacing[3],
        paddingRight: spacing[3],
        paddingTop: spacing[1],
        paddingBottom: spacing[1],
        borderRadius: borderRadius.full,
        background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.accent[500]} 100%)`,
        color: colors.neutral[0],
        fontSize: '0.75rem',
        fontWeight: 600,
        boxShadow: shadows.blue,
        transition: transitions.common.all,
      }}
    >
      {text}
    </span>
  )
}
