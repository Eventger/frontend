import { Clock, ListTodo } from 'lucide-react'
import { getCalendarDay } from '@/lib/calendar'
import { formatHoursDuration } from '@/lib/duration'

import type { Subtask } from '@/features/events/types/subtask.types'

type EventProgressCardProps = {
  subtasks: Subtask[]
  eventDate?: string
}

function getPendingHours(subtasks: Subtask[]) {
  return subtasks
    .filter(
      (subtask) =>
        subtask.state !== 'completed' && subtask.state !== 'postponed',
    )
    .reduce(
      (total, subtask) =>
        total + subtask.estimatedHours,
      0,
    )
}

function getDailyLoad(
  subtasks: Subtask[],
  eventDate?: string,
) {
  const pendingHours = getPendingHours(subtasks)

  if (
    pendingHours === 0 ||
    !eventDate
  ) {
    return 0
  }

  const todayDay = getCalendarDay(new Date())
  const eventDay = getCalendarDay(eventDate)

  const daysRemaining = Math.max(
    1,
    Math.ceil(
      eventDay - todayDay,
    ),
  )

  return pendingHours / daysRemaining
}

function formatDailyLoad(hours: number): string {
  if (hours <= 0) {
    return '0 h / día'
  }
  return `${formatHoursDuration(hours)} / día`
}

function formatPendingHours(hours: number): string {
  if (hours <= 0) {
    return '0 h'
  }
  return formatHoursDuration(hours)
}

export function EventProgressCard({
  subtasks,
  eventDate,
}: EventProgressCardProps) {
  const totalSubtasks = subtasks.length

  const completedSubtasks =
    subtasks.filter(
      (subtask) =>
        subtask.state === 'completed',
    ).length

  const progress =
    totalSubtasks === 0
      ? 0
      : Math.round(
          (completedSubtasks /
            totalSubtasks) *
            100,
        )

  const pendingHours = getPendingHours(subtasks)
  const dailyLoad = getDailyLoad(
    subtasks,
    eventDate,
  )

  return (
    <div
      id="event-progress"
      tabIndex={-1}
      className="grid gap-6 outline-none md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] md:items-stretch md:gap-8"
    >
      {/* Columna Izquierda: Progreso del evento */}
      <div className="flex flex-col justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]">
            <ListTodo
              className="size-5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-[12px] sm:text-[13px] font-medium text-[#667085]">
              Progreso del evento
            </p>

            <p className="mt-0.5 text-[18px] sm:text-[20px] font-bold leading-6 tracking-tight text-[#17212b]">
              {progress}%
            </p>
          </div>
        </div>

        <div>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso general del evento: ${progress}%`}
            className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
          >
            <div
              className="h-full rounded-full bg-[#4f46e5] transition-[width] duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-2.5 text-[13px] text-[#667085]">
            {totalSubtasks === 0
              ? 'Aún no hay tareas creadas.'
              : `${completedSubtasks} de ${totalSubtasks} tareas completadas.`}
          </p>
        </div>
      </div>

      {/* Separador vertical para pantallas medianas/grandes */}
      <div
        className="hidden w-px bg-border-subtle md:block"
        aria-hidden="true"
      />

      {/* Columna Derecha: Horas pendientes y carga diaria */}
      <div className="flex flex-col justify-between gap-5 border-t border-border-subtle pt-6 md:border-0 md:pt-0">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]">
            <Clock
              className="size-5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-[12px] sm:text-[13px] font-medium text-[#667085]">
              Horas pendientes
            </p>

            <p className="mt-0.5 text-[18px] sm:text-[20px] font-bold leading-6 tracking-tight text-[#17212b]">
              {formatPendingHours(pendingHours)}
            </p>
          </div>
        </div>

        <div>
          {totalSubtasks === 0 ? (
            <p className="text-[13px] text-[#667085]">
              <span>0 h / día</span>
              <span className="mx-1.5 text-border-subtle">·</span>
              <span>Aún no hay tareas programadas.</span>
            </p>
          ) : (
            <p className="text-[13px] text-[#667085]">
              {formatDailyLoad(dailyLoad)} hasta la fecha del evento.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
