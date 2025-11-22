import { colors, typography, transitions } from '../../styles/design-system'

interface WordCounterProps {
  currentCount: number
  maxCount?: number
}

export default function WordCounter({
  currentCount,
  maxCount,
}: WordCounterProps) {
  const isOverLimit = maxCount ? currentCount > maxCount : false
  const isNearLimit = maxCount ? currentCount > maxCount * 0.9 : false

  let color = colors.neutral[400]
  if (isOverLimit) {
    color = colors.danger[500]
  } else if (isNearLimit) {
    color = colors.warning[500]
  }

  const percentage = maxCount ? (currentCount / maxCount) * 100 : 0

  return (
    <div
      className="flex flex-col items-end gap-1"
      style={{ transition: transitions.common.colors }}
    >
      <span
        style={{
          fontSize: typography.sizes.xs,
          color: color,
          fontWeight: 500,
          letterSpacing: typography.letterSpacing.wide,
          transition: transitions.common.colors,
        }}
      >
        {currentCount}
        {maxCount && (
          <span style={{ color: colors.neutral[400] }}>/{maxCount}</span>
        )}
      </span>
      {maxCount && (
        <div
          style={{
            width: '100%',
            height: '2px',
            background: colors.neutral[200],
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(percentage, 100)}%`,
              background: isOverLimit
                ? colors.danger[500]
                : isNearLimit
                  ? colors.warning[500]
                  : colors.primary[500],
              transition: transitions.common.all,
            }}
          />
        </div>
      )}
    </div>
  )
}
