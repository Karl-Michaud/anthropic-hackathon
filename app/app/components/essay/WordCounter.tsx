interface WordCounterProps {
  currentCount: number
  maxCount?: number
}

export default function WordCounter({ currentCount, maxCount }: WordCounterProps) {
  const isOverLimit = maxCount ? currentCount > maxCount : false
  const isNearLimit = maxCount ? currentCount > maxCount * 0.9 : false

  return (
    <span
      className={`text-[10px] ${
        isOverLimit
          ? 'text-red-400'
          : isNearLimit
          ? 'text-yellow-500'
          : 'text-gray-400'
      }`}
    >
      {currentCount}
      {maxCount && `/${maxCount}`}
    </span>
  )
}
