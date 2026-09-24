import { cn } from '@/lib/utils'

import type { Subtask } from '@/features/events/types/subtask.types'

type EventTaskCardProps = {
  subtask: Subtask
}

type VisualTaskStatus =
  | 'completed'
  | 'pending'
  | 'today'

const STATUS_LABELS: Record<
  VisualTaskStatus,
  string
> = {
  completed: 'Completada',
  pending: 'Pendiente',
  today: 'Hoy',
}

const STATUS_STYLES: Record<
  VisualTaskStatus,
  string
> = {
  completed: 'bg-[#ecfdf3] text-[#027a48]',
  pending: 'bg-[#eff8ff] text-[#175cd3]',
  today: 'bg-[#fffaeb] text-[#b54708]',
}

function formatTaskDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

function isToday(date: string) {
  const taskDate = new Date(date)
  const today = new Date()

  return (
    taskDate.getFullYear() === today.getFullYear() &&
    taskDate.getMonth() === today.getMonth() &&
    taskDate.getDate() === today.getDate()
  )
}

function getVisualStatus(
  subtask: Subtask,
): VisualTaskStatus {
  if (subtask.state === 'completed') {
    return 'completed'
  }

  if (isToday(subtask.targetDate)) {
    return 'today'
  }

  return 'pending'
}

export function EventTaskCard({
  subtask,
}: EventTaskCardProps) {
  const visualStatus =
    getVisualStatus(subtask)

  return (
    <article className="flex min-h-[92px] items-start justify-between gap-4 rounded-xl border border-[#dde2ea] bg-white p-4">
      <div>
        <h3 className="text-base font-semibold text-[#17212b]">
          {subtask.name}
        </h3>

        <p className="mt-2 text-[13px] text-[#667085]">
          {formatTaskDate(subtask.targetDate)}
          {' · '}
          {subtask.estimatedHours} h
        </p>

        {subtask.details && (
          <p className="mt-2 text-sm text-[#667085]">
            {subtask.details}
          </p>
        )}
      </div>

      <span
        className={cn(
          'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold',
          STATUS_STYLES[visualStatus],
        )}
      >
        {STATUS_LABELS[visualStatus]}
      </span>
    </article>
  )
}