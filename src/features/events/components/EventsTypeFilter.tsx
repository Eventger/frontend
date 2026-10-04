import { FilterSelect } from '@/components/FilterSelect'
import { useEventTypes } from '@/features/events/hooks/useEventTypes'

type EventsTypeFilterProps = {
  typeId: number | null
  onChange: (value: string) => void
}

export function EventsTypeFilter({ typeId, onChange }: EventsTypeFilterProps) {
  const { eventTypes, isLoading, error, retry } = useEventTypes()
  const value = typeId === null ? 'all' : String(typeId)
  const hasSelectedType = typeId !== null && eventTypes.some(type => type.id === typeId)

  return (
    <div>
      <div className="flex min-h-14 items-end gap-3">
        <div className="min-w-0 flex-1 sm:max-w-[360px]">
          <label htmlFor="events-type-filter" className="block text-[12px] font-semibold text-[#17212b]">
            Tipo de evento
          </label>
          <FilterSelect
            id="events-type-filter"
            value={value}
            disabled={isLoading}
            describedBy={error ? 'events-type-filter-error' : undefined}
            onValueChange={onChange}
            className="mt-2"
            options={[
              { value: 'all', label: 'Todos los tipos' },
              ...(typeId !== null && !hasSelectedType ? [{ value, label: 'Tipo seleccionado' }] : []),
              ...eventTypes.map(type => ({ value: String(type.id), label: type.name })),
            ]}
          />
        </div>
        <button
          type="button"
          onClick={() => onChange('all')}
          disabled={typeId === null}
          className="min-h-11 shrink-0 rounded-[8px] px-2 text-[12px] font-semibold text-[#4f46e5] transition-colors hover:bg-[#eef2ff] hover:text-[#3730a3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Limpiar filtro
        </button>
      </div>
      {error && (
        <div id="events-type-filter-error" className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-[#667085]" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => { void retry() }} className="min-h-11 rounded-lg px-2 font-semibold text-[#4f46e5] hover:bg-[#eef2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]">
            Reintentar tipos
          </button>
        </div>
      )}
    </div>
  )
}
