import { FilterSelect } from '@/components/FilterSelect'

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
    <div className="flex min-h-[56px] flex-col gap-3 rounded-[10px] md:flex-row md:items-center md:gap-7">
      <div className="flex min-w-0 flex-col gap-3 md:flex-1 md:flex-row md:items-center md:gap-3">
        <label
          htmlFor="today-event-filter"
          className="shrink-0 text-[12px] font-semibold text-[#17212b] md:w-[66px]"
        >
          Evento
        </label>

        <FilterSelect
          id="today-event-filter"
          value={selectedEventId}
          onValueChange={onEventChange}
          className="md:max-w-[360px] md:flex-1"
          options={[
            { value: 'all', label: 'Todos los eventos' },
            ...events.map(event => ({ value: String(event.id), label: event.name })),
          ]}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-3 md:flex-1 md:flex-row md:items-center md:gap-3">
        <label
          htmlFor="today-state-filter"
          className="shrink-0 text-[12px] font-semibold text-[#17212b] md:w-[76px]"
        >
          Estado
        </label>

        <FilterSelect
          id="today-state-filter"
          value={selectedState}
          onValueChange={value => {
            if (value === 'all' || value === 'today' || value === 'upcoming' || value === 'overdue') {
              onStateChange(value)
            }
          }}
          className="md:max-w-[310px] md:flex-1"
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'today', label: 'Para hoy' },
            { value: 'upcoming', label: 'Próximas' },
            { value: 'overdue', label: 'Vencidas' },
          ]}
        />
      </div>
      <button
        type="button"
        onClick={onClear}
        disabled={!hasActiveFilters}
        className="min-h-11 shrink-0 rounded-[8px] px-2 text-left text-[12px] font-semibold text-[#4f46e5] transition-colors hover:bg-[#eef2ff] hover:text-[#3730a3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#4f46e5] md:ml-auto md:w-[120px] md:text-center"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

export type {
  TodayStateFilter,
}
