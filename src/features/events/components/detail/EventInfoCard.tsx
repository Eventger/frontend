type EventInfoCardProps = {
  eventDate: string
  location: string
  contact: string
  eventTypeName?: string
  description?: string
}

function formatEventDate(
  date: string,
) {
  return new Intl.DateTimeFormat(
    'es-CO',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(new Date(date))
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
    <div>
      <p className="text-[13px] font-medium text-[#667085]">
        {label}
      </p>

      <p className="mt-2 text-base font-semibold text-[#17212b]">
        {value}
      </p>
    </div>
  )
}

export function EventInfoCard({
  eventDate,
  location,
  contact,
  eventTypeName,
  description,
}: EventInfoCardProps) {
  return (
    <section className="w-full max-w-[1022px] rounded-[14px] border border-[#dde2ea] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-[#17212b]">
          Información del evento
        </h2>

        {eventTypeName && (
          <span className="shrink-0 rounded-full bg-[#eef2ff] px-3 py-[6px] text-xs font-semibold text-[#3730a3]">
            {eventTypeName}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-3 md:gap-[50px]">
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

          <p className="mt-2 text-[13px] leading-5 text-[#17212b]">
            {description}
          </p>
        </div>
      )}
    </section>
  )
}