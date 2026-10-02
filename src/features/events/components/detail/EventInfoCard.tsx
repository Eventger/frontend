import { EventProgressCard } from '@/features/events/components/detail/EventProgressCard'
import { formatCalendarDate } from '@/lib/calendar'

import type { Subtask } from '@/features/events/types/subtask.types'

type EventInfoCardProps = {
  eventDate: string
  location: string
  contact: string
  subtasks: Subtask[]
  eventTypeName?: string
  description?: string
}

function formatEventDate(
  date: string,
) {
  return formatCalendarDate(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

type EventInfoItemProps = {
  label: string
  value: string
}

function EventInfoItem({
  label,
  value,
}: EventInfoItemProps) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-[#667085]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-[16px] font-semibold text-[#17212b]">
        {value}
      </p>
    </div>
  )
}

export function EventInfoCard({
  eventDate,
  location,
  contact,
  subtasks,
  eventTypeName,
  description,
}: EventInfoCardProps) {
  return (
    <section className="w-full rounded-[14px] border border-[#d9dee7] bg-white px-5 py-[18px] sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[20px] font-semibold leading-6 text-[#17212b]">
          Información del evento
        </h2>

        {eventTypeName && (
          <span className="min-w-[80px] shrink-0 rounded-full bg-[#eef2ff] px-3 py-1.5 text-center text-[12px] font-semibold leading-4 text-[#3730a3]">
            {eventTypeName}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-3 md:gap-10">
        <EventInfoItem
          label="Fecha"
          value={formatEventDate(
            eventDate,
          )}
        />

        <EventInfoItem
          label="Lugar"
          value={location}
        />

        <EventInfoItem
          label="Contacto"
          value={contact}
        />
      </div>

      {description && (
        <div className="mt-5">
          <p className="text-[13px] font-medium text-[#667085]">
            Descripción
          </p>

          <p className="mt-1.5 text-[13px] leading-5 text-[#17212b]">
            {description}
          </p>
        </div>
      )}

      <div className="mt-6 border-t border-[#dde2ea] pt-5">
        <EventProgressCard
          subtasks={subtasks}
          eventDate={eventDate}
        />
      </div>
    </section>
  )
}
