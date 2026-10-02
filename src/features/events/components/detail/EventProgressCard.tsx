import { CalendarDays } from 'lucide-react'
import { getCalendarDay } from '@/lib/calendar'

import type { Subtask } from '@/features/events/types/subtask.types'

type EventProgressCardProps = {
  subtasks: Subtask[]
  eventDate?: string
}

function getDailyLoad(
  subtasks: Subtask[],
  eventDate?: string,
) {
  const pendingHours = subtasks
    .filter(
      (subtask) =>
        subtask.state !== 'completed',
    )
    .reduce(
      (total, subtask) =>
        total + subtask.estimatedHours,
      0,
    )

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

function formatHours(hours: number) {
  return new Intl.NumberFormat(
    'es-CO',
    {
      maximumFractionDigits: 1,
    },
  ).format(hours)
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

  const dailyLoad = getDailyLoad(
    subtasks,
    eventDate,
  )

  return (
    <div
      id="event-progress"
      tabIndex={-1}
      className="grid gap-6 outline-none md:grid-cols-[minmax(0,1fr)_1px_minmax(0,0.9fr)] md:items-stretch md:gap-9"
    >
      <div>
        <p className="text-[14px] font-medium text-[#667085]">
          Progreso
        </p>

        <div className="mt-2 flex items-center gap-5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eef1f6]">
            <div
              className="h-full rounded-full bg-[#4f46e5] transition-[width] duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <span className="min-w-[50px] text-right text-[32px] font-semibold leading-none tracking-[-0.03em] text-[#17212b]">
            {progress}%
          </span>
        </div>

        <p className="mt-3 text-[13px] text-[#667085]">
          {totalSubtasks === 0
            ? 'Aún no hay tareas creadas.'
            : `${completedSubtasks} de ${totalSubtasks} tareas completadas.`}
        </p>
      </div>

      <div
        className="hidden w-px bg-[#dde2ea] md:block"
        aria-hidden="true"
      />

      <div className="flex items-center gap-5 border-t border-[#dde2ea] pt-6 md:border-0 md:pt-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]">
          <CalendarDays
            className="size-[18px]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div>
          <p className="text-[13px] font-medium text-[#667085]">
            Carga diaria
          </p>

          <p className="mt-1 text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#17212b]">
            {formatHours(dailyLoad)} h / día
          </p>

          <p className="mt-4 text-[13px] text-[#667085]">
            {totalSubtasks === 0
              ? 'Aún no hay tareas programadas.'
              : 'Promedio pendiente hasta la fecha del evento.'}
          </p>
        </div>
      </div>
    </div>
  )
}
