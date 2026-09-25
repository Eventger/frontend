import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { Subtask } from '@/features/events/types/subtask.types'

type EventTaskCardProps = {
  subtask: Subtask
  onEdit: (subtask: Subtask) => void
  onDelete: (subtask: Subtask) => void
}

type VisualTaskStatus =
  | 'completed'
  | 'overdue'
  | 'today'
  | 'upcoming'

const STATUS_LABELS: Record<
  VisualTaskStatus,
  string
> = {
  completed: 'Completada',
  overdue: 'Vencida',
  today: 'Hoy',
  upcoming: 'Próxima',
}

const STATUS_STYLES: Record<
  VisualTaskStatus,
  string
> = {
  completed: 'bg-[#ecfdf3] text-[#027a48]',
  overdue: 'bg-[#feeeec] text-[#b42318]',
  today: 'bg-[#fffaeb] text-[#b54708]',
  upcoming: 'bg-[#eff8ff] text-[#175cd3]',
}

function formatTaskDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

function getDateOnly(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime()
}

function getVisualStatus(
  subtask: Subtask,
): VisualTaskStatus {
  if (subtask.state === 'completed') {
    return 'completed'
  }

  const targetDate =
    getDateOnly(
      new Date(subtask.targetDate),
    )

  const today =
    getDateOnly(new Date())

  if (targetDate < today) {
    return 'overdue'
  }

  if (targetDate === today) {
    return 'today'
  }

  return 'upcoming'
}

export function EventTaskCard({
  subtask,
  onEdit,
  onDelete,
}: EventTaskCardProps) {
  const visualStatus =
    getVisualStatus(subtask)

  return (
    <article className="flex min-h-[92px] flex-col justify-between gap-4 rounded-[12px] border border-[#d9dee7] bg-white p-[18px] sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <h3 className="text-[18px] font-semibold leading-[22px] text-[#17212b]">
          {subtask.name}
        </h3>

        <p className="mt-2 text-[14px] text-[#667085]">
          {formatTaskDate(
            subtask.targetDate,
          )}
          {' · '}
          {subtask.estimatedHours} h
        </p>

        <p className="mt-2 h-5 max-w-full truncate text-[13px] leading-5 text-[#475467]">
          {subtask.details}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <span
          className={cn(
            'rounded-full px-3 py-1.5 text-[12px] font-semibold',
            STATUS_STYLES[
              visualStatus
            ],
          )}
        >
          {
            STATUS_LABELS[
              visualStatus
            ]
          }
        </span>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onEdit(subtask)
            }
            className="h-[30px] rounded-[8px] bg-[#f8fafc] px-[11px] text-[12px] font-semibold text-[#17212b]"
          >
            Editar
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onDelete(subtask)
            }
            className="h-[30px] rounded-[8px] border-[#b42318] bg-white px-[11px] text-[12px] font-semibold text-[#b42318] hover:bg-[#feeeec] hover:text-[#b42318]"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  )
}
