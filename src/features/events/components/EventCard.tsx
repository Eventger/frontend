import { Link } from 'react-router'

import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'
import { formatCalendarDate } from '@/lib/calendar'
import type { Event } from '@/features/events/types/event.types'

type EventCardProps = {
  event: Event
}

function formatEventDate(date: string) {
  return formatCalendarDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function EventCard({
  event,
}: EventCardProps) {
  const {
    subtasks,
    isLoading,
    error,
  } = useEventSubtasks(event.id)

  const totalTasks = subtasks.length

  const completedTasks = subtasks.filter(
    (subtask) =>
      subtask.state === 'completed',
  ).length

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100,
        )

  return (
    <Link
      to={`/evento/${event.id}`}
      viewTransition
      className="block min-h-[190px] w-full rounded-[16px] border border-[#dde2ea] bg-white p-5 transition-[border-color,box-shadow,transform] hover:border-[#c7d2fe] hover:shadow-[0_10px_24px_rgba(23,33,43,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
    >
      <h2 className="break-words text-[20px] font-semibold leading-6 text-[#17212b]">
        {event.name}
      </h2>

      <p className="mt-2 text-[13px] text-[#667085]">
        {formatEventDate(event.eventDate)}
      </p>

      <p className="mt-[22px] text-[14px] font-medium text-[#17212b]">
        {isLoading
          ? 'Cargando progreso…'
          : error
            ? 'Progreso no disponible'
            : `${progress} % · ${completedTasks}/${totalTasks} tareas`}
      </p>

      <div className="mt-[21px] h-2 w-full max-w-[440px] overflow-hidden rounded-[4px] bg-[#eaecf0]">
        <div
          className="h-full rounded-[4px] bg-[#4f46e5]"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-3 text-[13px] font-semibold text-[#4f46e5]">
        Ver evento →
      </p>
    </Link>
  )
}
