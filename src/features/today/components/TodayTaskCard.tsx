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
}: TodayTaskCardProps) {
  const styles =
    groupStyles[group]

  return (
    <article className="relative flex min-h-[60px] w-full items-center overflow-hidden rounded-[10px] border border-[#dde2ea] bg-white">
      <div
        className={[
          'absolute bottom-0 left-0 top-0 w-1',
          styles.accent,
        ].join(' ')}
      />

      <div className="min-w-0 flex-1 py-[9px] pl-[18px] pr-4">
        <p className="truncate text-[15px] font-semibold leading-[19px] text-[#17212b]">
          {task.name}
        </p>

        <p className="mt-[3px] truncate text-[12px] leading-4 text-[#667085]">
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

      <div className="hidden shrink-0 items-center gap-[22px] pr-[18px] sm:flex">
        <span
          className={[
            'inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-[6px] text-[12px] font-medium leading-[15px]',
            styles.badgeBackground,
            styles.badgeText,
          ].join(' ')}
        >
          {styles.badgeLabel}
        </span>

        <button
          type="button"
          aria-label={`Ver tarea: ${task.name}`}
          onClick={() =>
            onOpenTask(task)
          }
          className="flex h-11 w-[120px] items-center justify-center rounded-[8px] border border-[#dde2ea] bg-white text-[12px] font-semibold text-[#17212b] transition-colors hover:bg-[#f9fafb]"
        >
          Ver tarea
        </button>
      </div>

      <button
        type="button"
        aria-label={`Ver tarea: ${task.name}`}
        onClick={() =>
          onOpenTask(task)
        }
        className="mr-3 shrink-0 rounded-[8px] border border-[#dde2ea] bg-white px-3 py-2 text-[12px] font-semibold text-[#17212b] sm:hidden"
      >
        Ver
      </button>
    </article>
  )
}
