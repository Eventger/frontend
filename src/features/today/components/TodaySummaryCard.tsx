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
    container: string
    title: string
    value: string
  }
> = {
  danger: {
    container:
      'border-[#fef3f2] bg-[#fef3f2]',
    title: 'text-[#b42318]',
    value: 'text-[#b42318]',
  },

  warning: {
    container:
      'border-[#fffaeb] bg-[#fffaeb]',
    title: 'text-[#b54708]',
    value: 'text-[#b54708]',
  },

  info: {
    container:
      'border-[#eff8ff] bg-[#eff8ff]',
    title: 'text-[#175cd3]',
    value: 'text-[#175cd3]',
  },

  neutral: {
    container:
      'border-[#d9dee7] bg-white',
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
    <div
      className={[
        'min-h-[112px] rounded-[14px] border p-[18px]',
        styles.container,
      ].join(' ')}
    >
      <p
        className={[
          'text-[13px] font-semibold',
          styles.title,
        ].join(' ')}
      >
        {title}
      </p>

      <p
        className={[
          'mt-1 text-[30px] font-bold leading-tight',
          styles.value,
        ].join(' ')}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-[#667085]">
        {description}
      </p>
    </div>
  )
}