import type { ReactNode } from 'react'
import { Calendar, MapPin, User, Users } from 'lucide-react'
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
  icon: ReactNode
  label: string
  value: string
  secondaryValue?: string
}

function EventInfoItem({
  icon,
  label,
  value,
  secondaryValue,
}: EventInfoItemProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border-subtle/80 bg-white p-3.5 min-w-0 shadow-xs">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-[#667085]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-[14px] sm:text-[15px] font-bold text-[#17212b]">
          {value}
        </p>

        {secondaryValue && (
          <p className="mt-0.5 break-words text-[13px] font-normal text-[#667085]">
            {secondaryValue}
          </p>
        )}
      </div>
    </div>
  )
}

function getContactDetails(contact: string) {
  const normalizedContact = contact.trim()
  let phoneStart = normalizedContact.length
  while (phoneStart > 0 && /[\d\s()+.-]/.test(normalizedContact[phoneStart - 1])) {
    phoneStart -= 1
  }
  const name = normalizedContact.slice(0, phoneStart).trim()
  const phone = normalizedContact.slice(phoneStart).trim()

  if (!name || !/^\+?[\d(]/.test(phone) || !/\d$/.test(phone) || phone.replace(/\D/g, '').length < 7) {
    return { name: normalizedContact }
  }

  return {
    name,
    phone,
  }
}

export function EventInfoCard({
  eventDate,
  location,
  contact,
  subtasks,
  eventTypeName,
  description,
}: EventInfoCardProps) {
  const contactDetails = getContactDetails(contact)

  return (
    <section className="w-full rounded-2xl border border-border-subtle bg-white p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[20px] font-semibold leading-6 text-[#17212b]">
          Información del evento
        </h2>

        {eventTypeName && (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3.5 py-1.5 text-center text-[12px] font-semibold leading-4 text-[#4f46e5]">
            <Users className="size-3.5 text-[#4f46e5]" aria-hidden="true" />
            {eventTypeName}
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <EventInfoItem
          icon={<Calendar className="size-5 text-[#4f46e5]" aria-hidden="true" />}
          label="Fecha"
          value={formatEventDate(
            eventDate,
          )}
        />

        <EventInfoItem
          icon={<MapPin className="size-5 text-[#4f46e5]" aria-hidden="true" />}
          label="Lugar"
          value={location}
        />

        <EventInfoItem
          icon={<User className="size-5 text-[#4f46e5]" aria-hidden="true" />}
          label="Contacto del cliente"
          value={contactDetails.name}
          secondaryValue={contactDetails.phone ?? 'Teléfono no registrado'}
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

      <div className="mt-6 border-t border-border-subtle pt-6">
        <EventProgressCard
          subtasks={subtasks}
          eventDate={eventDate}
        />
      </div>
    </section>
  )
}
