import type {
  TodayTaskGroup,
  TodayTaskItem,
} from '@/features/today/types/today.types'

type TodayTaskCardProps = {
  task: TodayTaskItem
  group: TodayTaskGroup
  actionLabel?: string
  onOpen: () => void
}

const groupStyles = {
  overdue: {
    accent: 'bg-[#b42318]',
    badge:
      'bg-[#fef3f2] text-[#b42318]',
    label: 'Vencida',
    description:
      'Plazo vencido · necesita reprogramación o cierre',
    descriptionColor:
      'text-[#b42318]',
  },

  today: {
    accent: 'bg-[#b54708]',
    badge:
      'bg-[#fffaeb] text-[#b54708]',
    label: 'Hoy',
    description:
      'Vence hoy · prioridad alta',
    descriptionColor:
      'text-[#b54708]',
  },

  upcoming: {
    accent: 'bg-[#175cd3]',
    badge:
      'bg-[#eff8ff] text-[#175cd3]',
    label: 'Próxima',
    description:
      'Vence pronto · aún tienes margen para planificar',
    descriptionColor:
      'text-[#175cd3]',
  },
} satisfies Record<
  TodayTaskGroup,
  {
    accent: string
    badge: string
    label: string
    description: string
    descriptionColor: string
  }
>

function formatHours(
  hours: number,
) {
  if (Number.isInteger(hours)) {
    return String(hours)
  }

  return hours
    .toFixed(2)
    .replace(/\.?0{1,2}$/, '')
}

export function TodayTaskCard({
  task,
  group,
  actionLabel = 'Ver tarea',
  onOpen,
}: TodayTaskCardProps) {
  const styles =
    groupStyles[group]

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative w-full overflow-hidden rounded-[12px] border border-[#d9dee7] bg-white text-left transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${styles.accent}`}
      />

      <div className="min-h-[112px] px-[18px] py-4 pr-4 md:min-h-[84px] md:pr-[136px]">
        <p className="text-[15px] font-semibold text-[#17212b] md:text-base">
          {task.name}
        </p>

        <p className="mt-2 text-xs text-[#667085] md:mt-1 md:text-[13px]">
              {task.eventName}
              {' · '}

          {formatHours(
            task.estimatedHours,
          )}{' '}
          h
        </p>

        <p
          className={`mt-2 hidden text-xs font-medium md:block ${styles.descriptionColor}`}
        >
          {styles.description}
        </p>
      </div>

      <span
        className={[
          'absolute right-4 rounded-full px-3 py-[6px] text-xs font-semibold',
          'bottom-3 md:bottom-auto md:top-3',
          styles.badge,
        ].join(' ')}
      >
        {styles.label}
      </span>

      <span className="absolute bottom-2 right-4 hidden min-w-24 rounded-[8px] border border-[#d9dee7] bg-[#f8fafc] px-3 py-[7px] text-center text-xs font-semibold text-[#17212b] md:block">
        {actionLabel}
      </span>
    </button>
  )
}
