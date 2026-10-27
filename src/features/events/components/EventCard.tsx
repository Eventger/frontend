import { Link } from 'react-router'

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

export function EventCard({ event }: EventCardProps) {
  const progressData = event.progress ?? {
    completed: 0,
    total: 0,
    percentage: 0,
  }

  const { completed, total, percentage } = progressData

  return (
    <Link
      to={`/evento/${event.id}`}
      viewTransition
      className="block min-h-[190px] w-full rounded-2xl border border-border-subtle bg-white p-5 transition-[border-color,box-shadow] hover:border-[#c7d2fe] hover:shadow-[0_10px_24px_rgba(23,33,43,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] motion-reduce:transition-none"
    >
      <h2 className="type-section-title break-words text-[#17212b]">
        {event.name}
      </h2>

      <p className="mt-2 text-sm text-[#667085]">
        {formatEventDate(event.eventDate)}
      </p>

      <p className="mt-[22px] text-sm font-medium text-[#17212b]">
        {`${percentage} % · ${completed}/${total} tareas`}
      </p>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso del evento ${event.name}: ${percentage}%`}
        className="mt-[21px] h-2 w-full overflow-hidden rounded-full bg-neutral-100"
      >
        <div
          className="h-full rounded-full bg-[#4f46e5] transition-[width] duration-500 ease-out"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#4f46e5]">
        Ver evento →
      </p>
    </Link>
  )
}
