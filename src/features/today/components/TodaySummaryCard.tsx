type SummaryTone =
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'

type TodaySummaryCardProps = {
  title: string
  value: string | number
  description: string
  tone: SummaryTone
}

const toneStyles: Record<
  SummaryTone,
  {
    accent: string
    title: string
    value: string
  }
> = {
  danger: {
    accent: 'bg-[#b42318]',
    title: 'text-[#b42318]',
    value: 'text-[#b42318]',
  },

  warning: {
    accent: 'bg-[#b54708]',
    title: 'text-[#b54708]',
    value: 'text-[#b54708]',
  },

  info: {
    accent: 'bg-[#175cd3]',
    title: 'text-[#175cd3]',
    value: 'text-[#175cd3]',
  },

  neutral: {
    accent: 'bg-[#4f46e5]',
    title: 'text-[#4f46e5]',
    value: 'text-[#17212b]',
  },
}

export function TodaySummaryCard({
  title,
  value,
  description,
  tone,
}: TodaySummaryCardProps) {
  const styles =
    toneStyles[tone]

  return (
    <div className="relative min-h-[104px] overflow-hidden rounded-lg border border-border-subtle bg-white px-[18px] py-4">
      <div
        className={[
          'absolute bottom-0 left-0 top-0 w-1',
          styles.accent,
        ].join(' ')}
      />

      <p
        className={[
          'text-[13px] font-semibold leading-4',
          styles.title,
        ].join(' ')}
      >
        {title}
      </p>

      <p
        className={[
          'mt-[6px] font-bold leading-none',
          tone === 'neutral'
            ? 'text-[24px]'
            : 'text-[30px]',
          styles.value,
        ].join(' ')}
      >
        {value}
      </p>

      <p className="mt-[7px] text-[12px] leading-[15px] text-[#667085]">
        {description}
      </p>
    </div>
  )
}