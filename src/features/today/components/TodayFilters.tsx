type TodayStateFilter =
  | 'all'
  | 'today'
  | 'upcoming'
  | 'overdue'

type EventOption = {
  id: number
  name: string
}

type TodayFiltersProps = {
  events: EventOption[]
  selectedEventId: string
  selectedState: TodayStateFilter
  onEventChange: (
    eventId: string,
  ) => void
  onStateChange: (
    state: TodayStateFilter,
  ) => void
  onClear: () => void
}

export function TodayFilters({
  events,
  selectedEventId,
  selectedState,
  onEventChange,
  onStateChange,
  onClear,
}: TodayFiltersProps) {
  const hasActiveFilters =
    selectedEventId !== 'all' ||
    selectedState !== 'all'

  return (
    <div className="flex min-h-[56px] flex-col gap-3 rounded-[10px] md:flex-row md:items-center md:gap-0">
      <label
        htmlFor="today-event-filter"
        className="text-[12px] font-semibold text-[#17212b] md:w-[66px]"
      >
        Evento
      </label>

      <select
        id="today-event-filter"
        value={selectedEventId}
        onChange={(event) =>
          onEventChange(
            event.target.value,
          )
        }
        className="h-11 rounded-[8px] border border-[#dde2ea] bg-white px-[13px] text-[13px] text-[#17212b] outline-none focus:border-[#4f46e5] md:w-[360px]"
      >
        <option value="all">
          Todos los eventos
        </option>

        {events.map((event) => (
          <option
            key={event.id}
            value={String(event.id)}
          >
            {event.name}
          </option>
        ))}
      </select>

      <label
        htmlFor="today-state-filter"
        className="text-[12px] font-semibold text-[#17212b] md:ml-7 md:w-[76px]"
      >
        Estado
      </label>

      <select
        id="today-state-filter"
        value={selectedState}
        onChange={(event) =>
          onStateChange(
            event.target
              .value as TodayStateFilter,
          )
        }
        className="h-11 rounded-[8px] border border-[#dde2ea] bg-white px-[13px] text-[13px] text-[#17212b] outline-none focus:border-[#4f46e5] md:w-[310px]"
      >
        <option value="all">
          Todos
        </option>

        <option value="today">
          Para hoy
        </option>

        <option value="upcoming">
          Próximas
        </option>

        <option value="overdue">
          Vencidas
        </option>
      </select>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasActiveFilters}
        className="text-left text-[12px] font-semibold text-[#4f46e5] transition-opacity disabled:cursor-default disabled:opacity-40 md:ml-auto md:w-[120px] md:text-center"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

export type {
  TodayStateFilter,
}