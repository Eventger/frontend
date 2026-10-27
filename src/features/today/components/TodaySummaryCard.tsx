import { AlertCircle, Calendar, CalendarClock, ChevronRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    iconBg: string
    iconColor: string
    icon: typeof AlertCircle
  }
> = {
  danger: {
    accent: 'bg-[#b42318]',
    title: 'text-[#b42318]',
    value: 'text-[#b42318]',
    iconBg: 'bg-[#fef3f2]',
    iconColor: 'text-[#b42318]',
    icon: AlertCircle,
  },

  warning: {
    accent: 'bg-[#b54708]',
    title: 'text-[#b54708]',
    value: 'text-[#17212b]',
    iconBg: 'bg-[#fffaeb]',
    iconColor: 'text-[#b54708]',
    icon: Calendar,
  },

  info: {
    accent: 'bg-[#175cd3]',
    title: 'text-[#175cd3]',
    value: 'text-[#17212b]',
    iconBg: 'bg-[#eff8ff]',
    iconColor: 'text-[#175cd3]',
    icon: CalendarClock,
  },

  neutral: {
    accent: 'bg-[#4f46e5]',
    title: 'text-[#4f46e5]',
    value: 'text-[#17212b]',
    iconBg: 'bg-[#f4f3ff]',
    iconColor: 'text-[#4f46e5]',
    icon: Clock,
  },
}

export function TodaySummaryCard({
  title,
  value,
  description,
  tone,
}: TodaySummaryCardProps) {
  const styles = toneStyles[tone]
  const Icon = styles.icon

  return (
    <div className="relative flex h-full min-h-[148px] flex-col justify-between overflow-hidden rounded-xl border border-border-subtle bg-white p-4 sm:p-4.5 shadow-sm transition-colors hover:border-[#c7d2fe]">
      {/* Indicador de estado lateral en cápsula con esquinas redondeadas */}
      <div
        className={cn(
          'absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full',
          styles.accent,
        )}
        aria-hidden="true"
      />

      <div>
        {/* Cabecera con ícono en pastilla, título y flecha derecha */}
        <div className="flex h-7 items-center justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full',
                styles.iconBg,
              )}
            >
              <Icon className={cn('size-4 shrink-0', styles.iconColor)} aria-hidden="true" />
            </span>
            <span
              className={cn(
                'text-[13px] sm:text-[14px] font-semibold leading-none whitespace-nowrap',
                styles.title,
              )}
            >
              {title}
            </span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-[#98a2b3]" aria-hidden="true" />
        </div>

        {/* Métrica principal en número grande */}
        <p
          className={cn(
            'mt-3.5 text-[32px] font-bold leading-none tracking-tight',
            styles.value,
          )}
        >
          {value}
        </p>
      </div>

      {/* Descripción secundaria en gris */}
      <p className="mt-2 text-[12px] sm:text-[13px] leading-4 text-[#667085] capitalize-first">
        {description}
      </p>
    </div>
  )
}