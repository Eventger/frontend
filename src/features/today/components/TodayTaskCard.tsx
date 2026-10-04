import type {
  TodayTaskItem,
} from '@/features/today/types/today.types'

type TaskGroup =
  | 'overdue'
  | 'today'
  | 'upcoming'

type TodayTaskCardProps = {
  task: TodayTaskItem
  group: TaskGroup
  onOpenTask: (
    task: TodayTaskItem,
  ) => void
  onRescheduleTask?: (task: TodayTaskItem) => void
}

const groupStyles: Record<
  TaskGroup,
  {
    accent: string
    badgeBackground: string
    badgeText: string
    badgeLabel: string
  }
> = {
  overdue: {
    accent: 'bg-[#b42318]',
    badgeBackground: 'bg-[#fef3f2]',
    badgeText: 'text-[#b42318]',
    badgeLabel: 'Vencida',
  },

  today: {
    accent: 'bg-[#b54708]',
    badgeBackground: 'bg-[#fffaeb]',
    badgeText: 'text-[#b54708]',
    badgeLabel: 'Hoy',
  },

  upcoming: {
    accent: 'bg-[#175cd3]',
    badgeBackground: 'bg-[#eff8ff]',
    badgeText: 'text-[#175cd3]',
    badgeLabel: 'Próxima',
  },
}

function formatTaskDate(
  date: string,
) {
  const parsedDate =
    new Date(date)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return date
  }

  return new Intl.DateTimeFormat(
    'es-CO',
    {
      day: 'numeric',
      month: 'short',
      timeZone: 'America/Bogota',
    },
  )
    .format(parsedDate)
    .replace('.', '')
}

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
  onOpenTask,
  onRescheduleTask,
}: TodayTaskCardProps) {
  const styles =
    groupStyles[group]

  return (
    <article className="relative isolate flex min-h-[112px] w-full items-start overflow-hidden rounded-[14px] border border-[#d9dee7] bg-white sm:min-h-[60px] sm:items-center sm:rounded-[12px]">
      <div
        className={[
          'absolute bottom-0 left-0 top-0 hidden w-1 sm:block',
          styles.accent,
        ].join(' ')}
      />

      <div className="min-w-0 flex-1 pb-12 pl-4 pr-4 pt-[15px] sm:py-[9px] sm:pl-[18px]">
        <p className="truncate text-[15px] font-semibold leading-[19px] text-[#17212b] sm:text-[16px]">
          {task.name}
        </p>

        <p className="mt-2 truncate text-[12px] leading-4 text-[#667085] sm:mt-[3px]">
          {task.eventName}

          {' · '}

          {formatTaskDate(
            task.targetDate,
          )}

          {' · '}

          {formatHours(
            task.estimatedHours,
          )}{' '}
          h
        </p>
      </div>

      <button
        type="button"
        aria-label={`Ver tarea: ${task.name}`}
        onClick={() =>
          onOpenTask(task)
        }
        className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#4f46e5] sm:hidden"
      />

      <div className="pointer-events-none absolute bottom-[13px] right-4 z-20 flex items-center sm:pointer-events-auto sm:static sm:shrink-0 sm:gap-[22px] sm:pr-[18px]">
        <span
          className={[
            'inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-[6px] text-[12px] font-medium leading-[15px] sm:min-w-[88px]',
            styles.badgeBackground,
            styles.badgeText,
          ].join(' ')}
        >
          {styles.badgeLabel}
        </span>

        {onRescheduleTask && <button type="button" aria-label={`Reprogramar tarea: ${task.name}`} onClick={() => onRescheduleTask(task)} className="pointer-events-auto ml-3 flex h-11 items-center justify-center rounded-[8px] border border-[#dde2ea] bg-white px-3 text-[12px] font-semibold text-[#3730a3] hover:bg-[#f9fafb] focus-visible:outline-2 focus-visible:outline-[#4f46e5] sm:ml-0">Reprogramar</button>}

        <button
          type="button"
          aria-label={`Ver tarea: ${task.name}`}
          onClick={() =>
            onOpenTask(task)
          }
          className="hidden h-11 w-[120px] items-center justify-center rounded-[8px] border border-[#dde2ea] bg-white text-[12px] font-semibold text-[#3730a3] transition-colors hover:bg-[#f9fafb] sm:flex"
        >
          Ver tarea
        </button>
      </div>
    </article>
  )
}
