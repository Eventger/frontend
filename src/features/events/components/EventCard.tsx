import type { Event } from '@/features/events/types/event.types'

type EventCardProps = {
  event: Event
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="rounded-2xl border border-[#dde2ea] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#17212b] sm:text-xl">
        {event.name}
      </h2>

      <p className="mt-1 text-[13px] text-[#667085]">
        {formatEventDate(event.eventDate)}
      </p>

      <p className="mt-5 text-sm font-medium text-[#17212b]">
        {event.location}
      </p>
    </article>
  )
}
